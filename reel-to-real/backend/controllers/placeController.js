const Place = require('../models/Place');
const { AppError } = require('../middleware/errorHandler');

/**
 * @route   GET /api/places
 * @desc    Get places (with optional geo filtering)
 * @access  Private
 */
exports.getPlaces = async (req, res, next) => {
    try {
        const { lat, lng, category, savedOnly } = req.query;

        let query = {};

        // Filter by saved places
        if (savedOnly === 'true') {
            query.savedBy = req.user._id;
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Get all places without geolocation filtering
        let places = await Place.find(query)
            .sort({ createdAt: -1 })
            .limit(100);

        // If coordinates provided, add distance to each place for display
        if (lat && lng) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);

            places = places.map(place => {
                const placeObj = place.toObject();
                placeObj.distance = place.distanceFrom(longitude, latitude);
                return placeObj;
            });
        }

        res.status(200).json({
            success: true,
            count: places.length,
            places
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/places/:id
 * @desc    Get single place
 * @access  Private
 */
exports.getPlace = async (req, res, next) => {
    try {
        const place = await Place.findById(req.params.id);

        if (!place) {
            throw new AppError('Place not found', 404, 'PLACE_NOT_FOUND');
        }

        // Add distance if user location available
        let placeObj = place.toObject();
        if (req.user.location && req.user.location.coordinates) {
            const [lng, lat] = req.user.location.coordinates;
            placeObj.distance = place.distanceFrom(lng, lat);
        }

        res.status(200).json({
            success: true,
            place: placeObj
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/places/save
 * @desc    Save a place to user's saved places
 * @access  Private
 */
exports.savePlace = async (req, res, next) => {
    try {
        const { placeId } = req.body;

        if (!placeId) {
            throw new AppError('Place ID is required', 400, 'MISSING_PLACE_ID');
        }

        const place = await Place.findById(placeId);

        if (!place) {
            throw new AppError('Place not found', 404, 'PLACE_NOT_FOUND');
        }

        // Add user to savedBy
        await place.saveByUser(req.user._id);

        res.status(200).json({
            success: true,
            message: 'Place saved successfully',
            place
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/places/unsave
 * @desc    Remove a place from user's saved places
 * @access  Private
 */
exports.unsavePlace = async (req, res, next) => {
    try {
        const { placeId } = req.body;

        if (!placeId) {
            throw new AppError('Place ID is required', 400, 'MISSING_PLACE_ID');
        }

        const place = await Place.findById(placeId);

        if (!place) {
            throw new AppError('Place not found', 404, 'PLACE_NOT_FOUND');
        }

        // Remove user from savedBy
        await place.unsaveByUser(req.user._id);

        res.status(200).json({
            success: true,
            message: 'Place unsaved successfully',
            place
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/places/search
 * @desc    Search places by name or address
 * @access  Private
 */
exports.searchPlaces = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q) {
            throw new AppError('Search query is required', 400, 'MISSING_QUERY');
        }

        const places = await Place.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { address: { $regex: q, $options: 'i' } },
                { specialties: { $in: [new RegExp(q, 'i')] } }
            ]
        }).limit(50);

        res.status(200).json({
            success: true,
            count: places.length,
            places
        });
    } catch (error) {
        next(error);
    }
};
