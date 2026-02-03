const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    placeId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: null
    },
    specialties: {
        type: [String],
        default: []
    },
    category: {
        type: String,
        enum: ['cafe', 'restaurant', 'bar', 'bakery', 'food_truck', 'other'],
        default: 'other'
    },
    photos: {
        type: [String],
        default: []
    },
    externalData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
placeSchema.index({ placeId: 1 }, { unique: true });
placeSchema.index({ location: '2dsphere' });
placeSchema.index({ savedBy: 1 });
placeSchema.index({ category: 1 });

// Method to calculate distance from a point
placeSchema.methods.distanceFrom = function (longitude, latitude) {
    const [placeLng, placeLat] = this.location.coordinates;

    // Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const φ1 = placeLat * Math.PI / 180;
    const φ2 = latitude * Math.PI / 180;
    const Δφ = (latitude - placeLat) * Math.PI / 180;
    const Δλ = (longitude - placeLng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in meters
};

// Method to add user to savedBy
placeSchema.methods.saveByUser = async function (userId) {
    if (!this.savedBy.includes(userId)) {
        this.savedBy.push(userId);
        return await this.save();
    }
    return this;
};

// Method to remove user from savedBy
placeSchema.methods.unsaveByUser = async function (userId) {
    this.savedBy = this.savedBy.filter(id => !id.equals(userId));
    return await this.save();
};

module.exports = mongoose.model('Place', placeSchema);
