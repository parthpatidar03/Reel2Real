# YouTube Shorts & Video Length Validation Setup

## What's New

✅ **YouTube Shorts Support**: The app now accepts YouTube Shorts URLs in addition to Instagram Reels
✅ **90-Second Limit**: Videos longer than 90 seconds are automatically rejected
✅ **Smart Validation**: Duration is checked before expensive AI processing

## System Requirements

### Install yt-dlp

The video download functionality requires **yt-dlp** to be installed on your system.

#### Windows Installation

**Option 1: Using winget (Recommended)**
```bash
winget install yt-dlp
```

**Option 2: Using pip**
```bash
pip install yt-dlp
```

**Option 3: Manual Download**
1. Download from: https://github.com/yt-dlp/yt-dlp/releases
2. Place `yt-dlp.exe` in a folder in your PATH
3. Or place it in the project's `backend` folder

#### Verify Installation

```bash
yt-dlp --version
```

You should see the version number (e.g., `2024.01.01`).

## Supported Platforms

### Instagram Reels
- Format: `https://www.instagram.com/reel/[ID]/`
- Format: `https://instagram.com/reels/[ID]/`

### YouTube Shorts
- Format: `https://www.youtube.com/shorts/[ID]`
- Format: `https://youtu.be/[ID]`

## Video Constraints

- **Maximum Duration**: 90 seconds
- **Maximum File Size**: 100MB
- **Supported Formats**: MP4, MOV, AVI, WEBM, MKV
- **Download Quality**: 720p (optimized for processing speed)

## How It Works

1. **URL Validation**: System checks if URL matches Instagram Reel or YouTube Shorts pattern
2. **Video Download**: yt-dlp downloads the video in 720p MP4 format
3. **Duration Check**: ffprobe extracts video duration
4. **Validation**: If > 90 seconds, video is deleted and error is returned
5. **Processing**: If valid, video is queued for AI processing

## Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Invalid URL. Please provide an Instagram Reel or YouTube Shorts URL" | URL doesn't match supported patterns | Use a valid Instagram Reel or YouTube Shorts URL |
| "Video duration (Xs) exceeds maximum allowed duration of 90s" | Video is too long | Use a shorter video (max 90 seconds) |
| "Failed to download video" | Download failed | Check internet connection, verify video is public and not deleted |

## Testing

### Test Instagram Reel
```bash
# Use any public Instagram Reel URL under 90 seconds
curl -X POST http://localhost:5000/api/reels/ingest \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "url", "url": "https://www.instagram.com/reel/EXAMPLE/"}'
```

### Test YouTube Shorts
```bash
# Use any public YouTube Shorts URL under 90 seconds
curl -X POST http://localhost:5000/api/reels/ingest \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "url", "url": "https://www.youtube.com/shorts/EXAMPLE"}'
```

### Test Video Length Validation
Upload a video longer than 90 seconds and verify it's rejected with appropriate error message.

## Troubleshooting

### "yt-dlp not found"
- Ensure yt-dlp is installed and in your PATH
- Try running `yt-dlp --version` in terminal
- Restart your terminal/IDE after installation

### "Failed to download video"
- Check if the video is public (not private/deleted)
- Verify your internet connection
- Some videos may be geo-restricted or have download restrictions

### "Could not determine video duration"
- The system will log a warning but continue processing
- This is usually fine for uploaded files
- For URL downloads, duration is always checked

## Code Changes Summary

### Backend
- `backend/config/constants.js` - New configuration file
- `backend/controllers/reelController.js` - Enhanced URL validation
- `worker/utils/videoProcessor.js` - Implemented download & duration check
- `backend/package.json` - Added `youtube-dl-exec` dependency

### Frontend
- `frontend/src/pages/Landing.jsx` - Updated copy to mention YouTube Shorts and 90s limit

## Next Steps

1. Install yt-dlp on your system
2. Restart the backend server
3. Test with both Instagram Reels and YouTube Shorts
4. Verify 90-second validation works correctly
