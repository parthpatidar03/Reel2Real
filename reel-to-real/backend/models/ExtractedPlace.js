const mongoose = require('mongoose');

const extractedPlaceSchema = new mongoose.Schema({
    reel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reel',
        required: true,
        index: true
    },
    rawName: {
        type: String,
        required: true
    },
    rawAddress: {
        type: String,
        default: null
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        required: true
    },
    resolvedPlace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        default: null
    },
    needsReview: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
extractedPlaceSchema.index({ reel: 1 });
extractedPlaceSchema.index({ confidence: 1 });
extractedPlaceSchema.index({ needsReview: 1 });

// Automatically set needsReview based on confidence
extractedPlaceSchema.pre('save', function (next) {
    if (this.confidence < 0.5) {
        this.needsReview = true;
    }
    next();
});

module.exports = mongoose.model('ExtractedPlace', extractedPlaceSchema);
