const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reelController = require('../controllers/reelController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../config/upload');

// All routes are protected
router.use(protect);

// Ingest reel (URL or upload)
router.post(
    '/ingest',
    upload.single('video'),
    [
        body('type').isIn(['url', 'upload']).withMessage('Type must be "url" or "upload"'),
        body('url').optional().isURL().withMessage('Valid URL is required'),
        validate
    ],
    reelController.ingestReel
);

// Get user's reels
router.get('/', reelController.getUserReels);

// Get specific reel status
router.get('/:id', reelController.getReelStatus);

// Delete reel
router.delete('/:id', reelController.deleteReel);

module.exports = router;
