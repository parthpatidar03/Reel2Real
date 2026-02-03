const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const placeController = require('../controllers/placeController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes are protected
router.use(protect);

// Get places (with optional geo filtering)
router.get('/', placeController.getPlaces);

// Search places
router.get('/search', placeController.searchPlaces);

// Get single place
router.get('/:id', placeController.getPlace);

// Save place
router.post(
    '/save',
    [
        body('placeId').notEmpty().withMessage('Place ID is required'),
        validate
    ],
    placeController.savePlace
);

// Unsave place
router.post(
    '/unsave',
    [
        body('placeId').notEmpty().withMessage('Place ID is required'),
        validate
    ],
    placeController.unsavePlace
);

module.exports = router;
