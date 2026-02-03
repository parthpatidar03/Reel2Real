const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

/**
 * Extract audio from video file
 * @param {string} videoPath - Path to video file
 * @returns {Promise<string>} - Path to extracted audio file
 */
async function extractAudio(videoPath) {
    return new Promise((resolve, reject) => {
        const audioPath = videoPath.replace(path.extname(videoPath), '.mp3');

        ffmpeg(videoPath)
            .output(audioPath)
            .noVideo()
            .audioCodec('libmp3lame')
            .on('end', () => {
                console.log('Audio extraction completed');
                resolve(audioPath);
            })
            .on('error', (err) => {
                console.error('Error extracting audio:', err);
                reject(err);
            })
            .run();
    });
}

/**
 * Extract frames from video
 * @param {string} videoPath - Path to video file
 * @param {number} fps - Frames per second to extract (default: 1)
 * @returns {Promise<string[]>} - Array of frame file paths
 */
async function extractFrames(videoPath, fps = 1) {
    return new Promise((resolve, reject) => {
        const framesDir = `${videoPath}_frames`;

        // Create frames directory
        fs.mkdir(framesDir, { recursive: true })
            .then(() => {
                ffmpeg(videoPath)
                    .outputOptions([
                        `-vf fps=${fps}`,
                        '-q:v 2' // Quality (lower is better, 2-5 is good)
                    ])
                    .output(`${framesDir}/frame_%04d.jpg`)
                    .on('end', async () => {
                        console.log('Frame extraction completed');

                        // Get all frame files
                        const files = await fs.readdir(framesDir);
                        const framePaths = files
                            .filter(f => f.endsWith('.jpg'))
                            .map(f => path.join(framesDir, f));

                        resolve(framePaths);
                    })
                    .on('error', (err) => {
                        console.error('Error extracting frames:', err);
                        reject(err);
                    })
                    .run();
            })
            .catch(reject);
    });
}

/**
 * Download video from URL (Instagram Reels or YouTube Shorts)
 * @param {string} url - Video URL
 * @param {string} outputDir - Directory to save downloaded video
 * @returns {Promise<string>} - Path to downloaded video
 */
async function downloadVideo(url, outputDir = './uploads') {
    // Use create() to specify system-installed yt-dlp (avoids path issues with spaces)
    const youtubedl = require('youtube-dl-exec').create('yt-dlp');
    const { MAX_VIDEO_DURATION_SECONDS, DOWNLOAD_QUALITY } = require('../../backend/config/constants');

    try {
        // Ensure output directory exists
        await fs.mkdir(outputDir, { recursive: true });

        const timestamp = Date.now();
        const outputTemplate = path.join(outputDir, `video_${timestamp}.%(ext)s`);

        console.log(`Downloading video from: ${url}`);

        // Check if URL is Instagram (needs cookies) or YouTube (usually works without)
        const isInstagram = url.includes('instagram.com');
        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

        // Build download options
        const downloadOptions = {
            format: `best[height<=720][ext=mp4]/best[height<=720]/best`,
            output: outputTemplate,
            noPlaylist: true,
            maxFilesize: '100M',
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                'referer:https://www.instagram.com/',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        };

        // Only use cookies for Instagram (YouTube usually works without)
        if (isInstagram) {
            const browserCookies = process.env.BROWSER_FOR_COOKIES || 'firefox';
            console.log(`Instagram detected - using cookies from: ${browserCookies}`);
            downloadOptions.cookiesFromBrowser = browserCookies;
        } else {
            console.log(`YouTube detected - downloading without cookies`);
        }

        // Download video with yt-dlp
        const output = await youtubedl(url, downloadOptions);

        // Find the downloaded file
        const files = await fs.readdir(outputDir);
        const downloadedFile = files.find(f => f.startsWith(`video_${timestamp}`));

        if (!downloadedFile) {
            throw new Error('Downloaded file not found');
        }

        const videoPath = path.join(outputDir, downloadedFile);

        // Check video duration
        const duration = await getVideoDuration(videoPath);
        if (duration > MAX_VIDEO_DURATION_SECONDS) {
            // Delete the file
            await fs.unlink(videoPath);
            throw new Error(`Video duration (${Math.round(duration)}s) exceeds maximum allowed duration of ${MAX_VIDEO_DURATION_SECONDS}s`);
        }

        console.log(`Video downloaded successfully: ${videoPath} (${Math.round(duration)}s)`);
        return videoPath;

    } catch (error) {
        console.error('Error downloading video:', error);
        throw new Error(`Failed to download video: ${error.message}`);
    }
}

/**
 * Get video duration in seconds
 * @param {string} videoPath - Path to video file
 * @returns {Promise<number>} - Duration in seconds
 */
async function getVideoDuration(videoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                const duration = metadata.format.duration;
                resolve(duration);
            }
        });
    });
}

module.exports = {
    extractAudio,
    extractFrames,
    downloadVideo,
    getVideoDuration
};
