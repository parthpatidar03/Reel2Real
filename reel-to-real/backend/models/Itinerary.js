const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    places: [{
        place: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Place',
            required: true
        },
        order: {
            type: Number,
            required: true
        },
        notes: {
            type: String,
            default: ''
        }
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
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
itinerarySchema.index({ user: 1, createdAt: -1 });

// Method to add place to itinerary
itinerarySchema.methods.addPlace = async function (placeId, notes = '') {
    const maxOrder = this.places.length > 0
        ? Math.max(...this.places.map(p => p.order))
        : 0;

    this.places.push({
        place: placeId,
        order: maxOrder + 1,
        notes
    });

    return await this.save();
};

// Method to remove place from itinerary
itinerarySchema.methods.removePlace = async function (placeId) {
    this.places = this.places.filter(p => !p.place.equals(placeId));

    // Reorder remaining places
    this.places.forEach((p, index) => {
        p.order = index + 1;
    });

    return await this.save();
};

// Method to reorder places
itinerarySchema.methods.reorderPlaces = async function (placeOrders) {
    // placeOrders is an array of { placeId, order }
    placeOrders.forEach(({ placeId, order }) => {
        const place = this.places.find(p => p.place.equals(placeId));
        if (place) {
            place.order = order;
        }
    });

    // Sort by order
    this.places.sort((a, b) => a.order - b.order);

    return await this.save();
};

module.exports = mongoose.model('Itinerary', itinerarySchema);
