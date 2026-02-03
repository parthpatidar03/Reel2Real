const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
exports.register = async (req, res, next) => {
    try {
        const { email, password, name, location } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('User already exists with this email', 400, 'USER_EXISTS');
        }

        // Create user
        const user = await User.create({
            email,
            password,
            name,
            location: location || { type: 'Point', coordinates: [0, 0] }
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email and password provided
        if (!email || !password) {
            throw new AppError('Please provide email and password', 400, 'MISSING_CREDENTIALS');
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            user: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/auth/update-location
 * @desc    Update user location
 * @access  Private
 */
exports.updateLocation = async (req, res, next) => {
    try {
        const { longitude, latitude } = req.body;

        if (!longitude || !latitude) {
            throw new AppError('Please provide longitude and latitude', 400, 'MISSING_COORDINATES');
        }

        req.user.location = {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };

        await req.user.save();

        res.status(200).json({
            success: true,
            user: req.user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};
