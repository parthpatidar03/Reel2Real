/**
 * Application-wide constants and configuration
 */

module.exports = {
    // Video processing limits
    MAX_VIDEO_DURATION_SECONDS: 90,
    MAX_FILE_SIZE_BYTES: 104857600, // 100MB

    // Supported video formats
    SUPPORTED_VIDEO_FORMATS: ['mp4', 'mov', 'avi', 'webm', 'mkv'],

    // Download settings
    DOWNLOAD_QUALITY: '720',
    DOWNLOAD_FORMAT: 'mp4',

    // URL patterns for supported platforms
    URL_PATTERNS: {
        INSTAGRAM_REEL: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|reels)\/([A-Za-z0-9_-]+)/,
        YOUTUBE_SHORTS: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]+)/
    },

    // Processing settings
    FRAME_EXTRACTION_FPS: 1,
    OCR_CONFIDENCE_THRESHOLD: 0.7,
    PLACE_MATCH_CONFIDENCE_THRESHOLD: 0.6
};
