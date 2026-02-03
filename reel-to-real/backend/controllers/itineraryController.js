const Itinerary = require('../models/Itinerary');
const Place = require('../models/Place');
const { AppError } = require('../middleware/errorHandler');

/**
 * @route   POST /api/itineraries
 * @desc    Create a new itinerary
 * @access  Private
 */
exports.createItinerary = async (req, res, next) => {
    try {
        const { name, description, places, isPublic } = req.body;

        if (!name) {
            throw new AppError('Itinerary name is required', 400, 'MISSING_NAME');
        }

        // Validate places exist
        if (places && places.length > 0) {
            const placeIds = places.map(p => p.placeId);
            const foundPlaces = await Place.find({ _id: { $in: placeIds } });

            if (foundPlaces.length !== placeIds.length) {
                throw new AppError('One or more places not found', 404, 'PLACES_NOT_FOUND');
            }
        }

        // Create itinerary
        const itinerary = await Itinerary.create({
            user: req.user._id,
            name,
            description: description || '',
            places: places ? places.map((p, index) => ({
                place: p.placeId,
                order: p.order || index + 1,
                notes: p.notes || ''
            })) : [],
            isPublic: isPublic || false
        });

        // Populate places
        await itinerary.populate('places.place');

        res.status(201).json({
            success: true,
            itinerary
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/itineraries
 * @desc    Get user's itineraries
 * @access  Private
 */
exports.getUserItineraries = async (req, res, next) => {
    try {
        const itineraries = await Itinerary.find({ user: req.user._id })
            .populate('places.place')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: itineraries.length,
            itineraries
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/itineraries/:id
 * @desc    Get single itinerary
 * @access  Private
 */
exports.getItinerary = async (req, res, next) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id)
            .populate('places.place');

        if (!itinerary) {
            throw new AppError('Itinerary not found', 404, 'ITINERARY_NOT_FOUND');
        }

        // Check ownership or public
        if (itinerary.user.toString() !== req.user._id.toString() && !itinerary.isPublic) {
            throw new AppError('Not authorized to access this itinerary', 403, 'NOT_AUTHORIZED');
        }

        res.status(200).json({
            success: true,
            itinerary
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/itineraries/:id
 * @desc    Update itinerary
 * @access  Private
 */
exports.updateItinerary = async (req, res, next) => {
    try {
        let itinerary = await Itinerary.findById(req.params.id);

        if (!itinerary) {
            throw new AppError('Itinerary not found', 404, 'ITINERARY_NOT_FOUND');
        }

        // Check ownership
        if (itinerary.user.toString() !== req.user._id.toString()) {
            throw new AppError('Not authorized to update this itinerary', 403, 'NOT_AUTHORIZED');
        }

        const { name, description, isPublic } = req.body;

        if (name) itinerary.name = name;
        if (description !== undefined) itinerary.description = description;
        if (isPublic !== undefined) itinerary.isPublic = isPublic;

        await itinerary.save();
        await itinerary.populate('places.place');

        res.status(200).json({
            success: true,
            itinerary
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/itineraries/:id
 * @desc    Delete itinerary
 * @access  Private
 */
exports.deleteItinerary = async (req, res, next) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);

        if (!itinerary) {
            throw new AppError('Itinerary not found', 404, 'ITINERARY_NOT_FOUND');
        }

        // Check ownership
        if (itinerary.user.toString() !== req.user._id.toString()) {
            throw new AppError('Not authorized to delete this itinerary', 403, 'NOT_AUTHORIZED');
        }

        await itinerary.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Itinerary deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/itineraries/:id/places
 * @desc    Add place to itinerary
 * @access  Private
 */
exports.addPlaceToItinerary = async (req, res, next) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);

        if (!itinerary) {
            throw new AppError('Itinerary not found', 404, 'ITINERARY_NOT_FOUND');
        }

        // Check ownership
        if (itinerary.user.toString() !== req.user._id.toString()) {
            throw new AppError('Not authorized to modify this itinerary', 403, 'NOT_AUTHORIZED');
        }

        const { placeId, notes } = req.body;

        if (!placeId) {
            throw new AppError('Place ID is required', 400, 'MISSING_PLACE_ID');
        }

        // Check if place exists
        const place = await Place.findById(placeId);
        if (!place) {
            throw new AppError('Place not found', 404, 'PLACE_NOT_FOUND');
        }

        await itinerary.addPlace(placeId, notes);
        await itinerary.populate('places.place');

        res.status(200).json({
            success: true,
            itinerary
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/itineraries/:id/places/:placeId
 * @desc    Remove place from itinerary
 * @access  Private
 */
exports.removePlaceFromItinerary = async (req, res, next) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);

        if (!itinerary) {
            throw new AppError('Itinerary not found', 404, 'ITINERARY_NOT_FOUND');
        }

        // Check ownership
        if (itinerary.user.toString() !== req.user._id.toString()) {
            throw new AppError('Not authorized to modify this itinerary', 403, 'NOT_AUTHORIZED');
        }

        await itinerary.removePlace(req.params.placeId);
        await itinerary.populate('places.place');

        res.status(200).json({
            success: true,
            itinerary
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/itineraries/:id/reorder
 * @desc    Reorder places in itinerary
 * @access  Private
 */
exports.reorderPlaces = async (req, res, next) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);

        if (!itinerary) {
            throw new AppError('Itinerary not found', 404, 'ITINERARY_NOT_FOUND');
        }

        // Check ownership
        if (itinerary.user.toString() !== req.user._id.toString()) {
            throw new AppError('Not authorized to modify this itinerary', 403, 'NOT_AUTHORIZED');
        }

        const { placeOrders } = req.body;

        if (!placeOrders || !Array.isArray(placeOrders)) {
            throw new AppError('Place orders array is required', 400, 'MISSING_PLACE_ORDERS');
        }

        await itinerary.reorderPlaces(placeOrders);
        await itinerary.populate('places.place');

        res.status(200).json({
            success: true,
            itinerary
        });
    } catch (error) {
        next(error);
    }
};
