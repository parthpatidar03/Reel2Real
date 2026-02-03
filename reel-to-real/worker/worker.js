require('dotenv').config();
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const path = require('path');
const fs = require('fs').promises;

// Import database connection from backend
const connectDB = require('../backend/config/database');

// Import utilities
const { extractAudio, extractFrames } = require('./utils/videoProcessor');
const { transcribeAudio, extractEntities } = require('./utils/aiProcessor');
const { performOCR, cleanOCRResults } = require('./utils/ocrProcessor');
const { resolvePlace } = require('./utils/placeResolver');

// Import models (using backend models)
const Reel = require('../backend/models/Reel');
const Place = require('../backend/models/Place');
const ExtractedPlace = require('../backend/models/ExtractedPlace');

// Create Redis connection
const connection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null
});

/**
 * Main job processor for PROCESS_REEL
 */
async function processReelJob(job) {
    const { reelId, videoPath, sourceUrl } = job.data;

    console.log(`\n========================================`);
    console.log(`Processing Reel: ${reelId}`);
    console.log(`========================================\n`);

    let reel;
    let audioPath;
    let framePaths = [];

    try {
        // Get reel from database
        console.log(`Looking for reel with ID: ${reelId}`);
        console.log(`ReelId type: ${typeof reelId}`);

        reel = await Reel.findById(reelId);

        console.log(`Reel found:`, reel ? 'YES' : 'NO');
        if (!reel) {
            // Try to find any reel to verify connection
            const anyReel = await Reel.findOne();
            console.log(`Any reel in database:`, anyReel ? 'YES' : 'NO');
            throw new Error('Reel not found');
        }

        // Update status
        await reel.updateProgress(5, 'processing');
        await job.updateProgress(5);

        // Step 0: Download video if URL-based (get actual video path)
        let actualVideoPath = videoPath;
        if (sourceUrl && (!videoPath || videoPath === 'pending')) {
            console.log('Step 0: Downloading video from URL...');
            const { downloadVideo } = require('./utils/videoProcessor');
            actualVideoPath = await downloadVideo(sourceUrl, './uploads');

            // Update reel with actual video path
            reel.videoPath = actualVideoPath;
            await reel.save();
            await reel.updateProgress(10);
            await job.updateProgress(10);
        }

        // Step 1: Extract audio (10% progress)
        console.log('Step 1: Extracting audio...');
        audioPath = await extractAudio(actualVideoPath);
        await reel.updateProgress(15);
        await job.updateProgress(15);

        // Step 2: Transcribe audio with Whisper (30% progress)
        console.log('Step 2: Transcribing audio with Whisper...');
        const transcript = await transcribeAudio(audioPath);
        reel.extractedData.audioTranscript = transcript;
        await reel.save();
        await reel.updateProgress(35);
        await job.updateProgress(35);

        // Step 3: Extract frames (40% progress)
        console.log('Step 3: Extracting video frames...');
        framePaths = await extractFrames(actualVideoPath, 1); // 1 frame per second
        await reel.updateProgress(45);
        await job.updateProgress(45);

        // Step 4: Perform OCR on frames (60% progress)
        console.log('Step 4: Performing OCR on frames...');
        const ocrTexts = await performOCR(framePaths);
        const cleanedOCR = cleanOCRResults(ocrTexts);
        reel.extractedData.ocrText = cleanedOCR;
        await reel.save();
        await reel.updateProgress(65);
        await job.updateProgress(65);

        // Step 5: Extract entities with GPT-4 (75% progress)
        console.log('Step 5: Extracting entities with GPT-4...');
        const entities = await extractEntities(transcript, cleanedOCR);
        reel.extractedData.rawEntities = entities;
        await reel.save();
        await reel.updateProgress(80);
        await job.updateProgress(80);

        // Step 6: Resolve place with Google Places API (90% progress)
        console.log('Step 6: Resolving place with Google Places API...');
        const { confidence, match, reason } = await resolvePlace(entities);

        console.log(`Place resolution: ${reason} (confidence: ${(confidence * 100).toFixed(1)}%)`);

        // Step 7: Save extracted place and create Place if confidence is sufficient
        let placeId = null;

        if (confidence >= 0.5 && match) {
            // Check if place already exists
            let place = await Place.findOne({ placeId: match.place_id });

            if (!place) {
                // Create new place
                place = await Place.create({
                    name: match.name,
                    address: match.formatted_address,
                    location: {
                        type: 'Point',
                        coordinates: [
                            match.geometry.location.lng,
                            match.geometry.location.lat
                        ]
                    },
                    placeId: match.place_id,
                    rating: match.rating || null,
                    specialties: entities.specialties || [],
                    category: entities.category || 'other',
                    photos: match.photos ? match.photos.map(p => p.photo_reference) : [],
                    externalData: match
                });

                console.log(`Created new place: ${place.name}`);
            } else {
                // Update existing place with new specialties
                if (entities.specialties && entities.specialties.length > 0) {
                    const newSpecialties = entities.specialties.filter(
                        s => !place.specialties.includes(s)
                    );
                    if (newSpecialties.length > 0) {
                        place.specialties.push(...newSpecialties);
                        await place.save();
                        console.log(`Updated place with new specialties: ${newSpecialties.join(', ')}`);
                    }
                }
            }

            placeId = place._id;
        }

        // Create ExtractedPlace record
        await ExtractedPlace.create({
            reel: reelId,
            rawName: entities.name || 'Unknown',
            rawAddress: entities.address || null,
            confidence,
            resolvedPlace: placeId,
            needsReview: confidence < 0.5
        });

        // Mark reel as completed
        await reel.markAsCompleted();
        await job.updateProgress(100);

        // Cleanup temporary files
        await cleanupFiles(audioPath, framePaths);

        console.log(`\n========================================`);
        console.log(`Reel processing completed: ${reelId}`);
        console.log(`========================================\n`);

        return {
            success: true,
            reelId,
            confidence,
            placeId,
            entities
        };

    } catch (error) {
        console.error(`Error processing reel ${reelId}:`, error);

        // Mark reel as failed
        if (reel) {
            await reel.markAsFailed(error.message);
        }

        // Cleanup temporary files
        if (audioPath || framePaths.length > 0) {
            await cleanupFiles(audioPath, framePaths);
        }

        throw error;
    }
}

/**
 * Cleanup temporary files
 */
async function cleanupFiles(audioPath, framePaths) {
    try {
        // Delete audio file
        if (audioPath) {
            await fs.unlink(audioPath).catch(err =>
                console.error('Error deleting audio file:', err.message)
            );
        }

        // Delete frames and frames directory
        if (framePaths && framePaths.length > 0) {
            const framesDir = path.dirname(framePaths[0]);

            // Delete all frame files
            await Promise.all(
                framePaths.map(fp =>
                    fs.unlink(fp).catch(err =>
                        console.error('Error deleting frame:', err.message)
                    )
                )
            );

            // Delete frames directory
            await fs.rmdir(framesDir).catch(err =>
                console.error('Error deleting frames directory:', err.message)
            );
        }

        console.log('Temporary files cleaned up');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

// Create worker
async function startWorker() {
    // First, ensure MongoDB is connected using backend's connectDB
    await connectDB();


    const worker = new Worker(
        'reel-processing',
        async (job) => {
            console.log(`Worker picked up job ${job.id}: ${job.name}`);

            if (job.name === 'PROCESS_REEL') {
                return await processReelJob(job);
            }

            throw new Error(`Unknown job type: ${job.name}`);
        },
        {
            connection,
            concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 2,
            limiter: {
                max: 10,
                duration: 60000 // Max 10 jobs per minute
            }
        }
    );

    // Worker event handlers
    worker.on('completed', (job, result) => {
        console.log(`✓ Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
        console.error(`✗ Job ${job.id} failed:`, err.message);
    });

    worker.on('error', (err) => {
        console.error('Worker error:', err);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('SIGTERM received, closing worker...');
        await worker.close();
        await connection.quit();
        await mongoose.connection.close();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        console.log('SIGINT received, closing worker...');
        await worker.close();
        await connection.quit();
        await mongoose.connection.close();
        process.exit(0);
    });

    console.log('✓ Worker started and waiting for jobs...');
    console.log(`Concurrency: ${parseInt(process.env.WORKER_CONCURRENCY) || 2}`);
}

// Start the worker
startWorker().catch(err => {
    console.error('Failed to start worker:', err);
    process.exit(1);
});

