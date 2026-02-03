const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes - requires valid JWT token
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                error: {
                    message: 'Not authorized to access this route',
                    code: 'NO_TOKEN'
                }
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({
                    error: {
                        message: 'User not found',
                        code: 'USER_NOT_FOUND'
                    }
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                error: {
                    message: 'Token is invalid or expired',
                    code: 'INVALID_TOKEN'
                }
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

module.exports = { protect, generateToken };
