const Reel = require('../models/Reel');
const { AppError } = require('../middleware/errorHandler');
const { addJobToQueue } = require('../config/queue');
const path = require('path');
const fs = require('fs').promises;

/**
 * @route   POST /api/reels/ingest
 * @desc    Ingest a new reel (URL or upload)
 * @access  Private
 */
exports.ingestReel = async (req, res, next) => {
    try {
        const { type, url } = req.body;
        let videoPath;

        if (type === 'url') {
            // URL-based ingestion
            if (!url) {
                throw new AppError('URL is required for URL-based ingestion', 400, 'MISSING_URL');
            }

            // Validate URL (Instagram Reels or YouTube Shorts)
            const { URL_PATTERNS } = require('../config/constants');
            const isInstagram = URL_PATTERNS.INSTAGRAM_REEL.test(url);
            const isYouTube = URL_PATTERNS.YOUTUBE_SHORTS.test(url);

            if (!isInstagram && !isYouTube) {
                throw new AppError(
                    'Invalid URL. Please provide an Instagram Reel or YouTube Shorts URL',
                    400,
                    'INVALID_URL'
                );
            }

            // Create reel with pending status
            const reel = await Reel.create({
                user: req.user._id,
                sourceUrl: url,
                videoPath: 'pending', // Will be updated by worker
                status: 'pending'
            });

            // Add job to queue
            await addJobToQueue('PROCESS_REEL', {
                reelId: reel._id.toString(),
                sourceUrl: url,
                userId: req.user._id.toString()
            });

            return res.status(202).json({
                success: true,
                message: 'Reel queued for processing',
                reel: {
                    id: reel._id,
                    status: reel.status,
                    progress: reel.processingProgress
                }
            });
        } else if (type === 'upload') {
            // File upload ingestion
            if (!req.file) {
                throw new AppError('Video file is required for upload', 400, 'MISSING_FILE');
            }

            videoPath = req.file.path;

            // Validate video duration
            const { getVideoDuration } = require('../../worker/utils/videoProcessor');
            const { MAX_VIDEO_DURATION_SECONDS } = require('../config/constants');

            try {
                const duration = await getVideoDuration(videoPath);
                if (duration > MAX_VIDEO_DURATION_SECONDS) {
                    // Delete the uploaded file
                    await fs.unlink(videoPath);
                    throw new AppError(
                        `Video duration (${Math.round(duration)}s) exceeds maximum allowed duration of ${MAX_VIDEO_DURATION_SECONDS}s`,
                        400,
                        'VIDEO_TOO_LONG'
                    );
                }
            } catch (error) {
                if (error.code === 'VIDEO_TOO_LONG') {
                    throw error;
                }
                // If we can't determine duration, log warning but continue
                console.warn('Could not determine video duration:', error.message);
            }

            // Create reel
            const reel = await Reel.create({
                user: req.user._id,
                videoPath,
                status: 'pending'
            });

            // Add job to queue
            await addJobToQueue('PROCESS_REEL', {
                reelId: reel._id.toString(),
                videoPath,
                userId: req.user._id.toString()
            });

            return res.status(202).json({
                success: true,
                message: 'Reel queued for processing',
                reel: {
                    id: reel._id,
                    status: reel.status,
                    progress: reel.processingProgress
                }
            });
        } else {
            throw new AppError('Invalid ingestion type. Must be "url" or "upload"', 400, 'INVALID_TYPE');
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/reels/:id
 * @desc    Get reel status and extracted data
 * @access  Private
 */
exports.getReelStatus = async (req, res, next) => {
    try {
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            throw new AppError('Reel not found', 404, 'REEL_NOT_FOUND');
        }

        // Check ownership
        if (reel.user.toString() !== req.user._id.toString()) {
            throw new AppError('Not authorized to access this reel', 403, 'NOT_AUTHORIZED');
        }

        // Get extracted places if completed
        let extractedPlaces = [];
        if (reel.status === 'completed') {
            const ExtractedPlace = require('../models/ExtractedPlace');
            extractedPlaces = await ExtractedPlace.find({ reel: reel._id })
                .populate('resolvedPlace');
        }

        res.status(200).json({
            success: true,
            reel: {
                id: reel._id,
                status: reel.status,
                progress: reel.processingProgress,
                extractedData: reel.extractedData,
                extractedPlaces,
                error: reel.error,
                createdAt: reel.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/reels
 * @desc    Get user's reels
 * @access  Private
 */
exports.getUserReels = async (req, res, next) => {
    try {
        const reels = await Reel.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: reels.length,
            reels: reels.map(reel => ({
                id: reel._id,
                status: reel.status,
                progress: reel.processingProgress,
                sourceUrl: reel.sourceUrl,
                createdAt: reel.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/reels/:id
 * @desc    Delete a reel
 * @access  Private
 */
exports.deleteReel = async (req, res, next) => {
    try {
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            throw new AppError('Reel not found', 404, 'REEL_NOT_FOUND');
        }

        // Check ownership
        if (reel.user.toString() !== req.user._id.toString()) {
            throw new AppError('Not authorized to delete this reel', 403, 'NOT_AUTHORIZED');
        }

        // Delete video file if exists
        if (reel.videoPath && reel.videoPath !== 'pending') {
            try {
                await fs.unlink(reel.videoPath);
            } catch (err) {
                console.error('Error deleting video file:', err);
            }
        }

        await reel.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Reel deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
