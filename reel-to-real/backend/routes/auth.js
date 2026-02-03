const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public routes
router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('name').notEmpty().withMessage('Name is required'),
        validate
    ],
    authController.register
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
        validate
    ],
    authController.login
);

// Protected routes
router.get('/me', protect, authController.getMe);

router.put(
    '/update-location',
    protect,
    [
        body('longitude').isFloat().withMessage('Valid longitude is required'),
        body('latitude').isFloat().withMessage('Valid latitude is required'),
        validate
    ],
    authController.updateLocation
);

module.exports = router;
