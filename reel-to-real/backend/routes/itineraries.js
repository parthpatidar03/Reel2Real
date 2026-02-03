const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const itineraryController = require('../controllers/itineraryController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes are protected
router.use(protect);

// Create itinerary
router.post(
    '/',
    [
        body('name').notEmpty().withMessage('Itinerary name is required'),
        validate
    ],
    itineraryController.createItinerary
);

// Get user's itineraries
router.get('/', itineraryController.getUserItineraries);

// Get single itinerary
router.get('/:id', itineraryController.getItinerary);

// Update itinerary
router.put('/:id', itineraryController.updateItinerary);

// Delete itinerary
router.delete('/:id', itineraryController.deleteItinerary);

// Add place to itinerary
router.post(
    '/:id/places',
    [
        body('placeId').notEmpty().withMessage('Place ID is required'),
        validate
    ],
    itineraryController.addPlaceToItinerary
);

// Remove place from itinerary
router.delete('/:id/places/:placeId', itineraryController.removePlaceFromItinerary);

// Reorder places in itinerary
router.put(
    '/:id/reorder',
    [
        body('placeOrders').isArray().withMessage('Place orders must be an array'),
        validate
    ],
    itineraryController.reorderPlaces
);

module.exports = router;
