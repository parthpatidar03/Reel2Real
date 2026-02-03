const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sourceUrl: {
        type: String,
        default: null
    },
    videoPath: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
        index: true
    },
    processingProgress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    extractedData: {
        audioTranscript: {
            type: String,
            default: null
        },
        ocrText: {
            type: [String],
            default: []
        },
        rawEntities: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    },
    error: {
        type: String,
        default: null
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
reelSchema.index({ user: 1, createdAt: -1 });
reelSchema.index({ status: 1 });

// Method to update progress
reelSchema.methods.updateProgress = async function (progress, status = null) {
    this.processingProgress = progress;
    if (status) {
        this.status = status;
    }
    return await this.save();
};

// Method to mark as failed
reelSchema.methods.markAsFailed = async function (errorMessage) {
    this.status = 'failed';
    this.error = errorMessage;
    return await this.save();
};

// Method to mark as completed
reelSchema.methods.markAsCompleted = async function () {
    this.status = 'completed';
    this.processingProgress = 100;
    return await this.save();
};

module.exports = mongoose.model('Reel', reelSchema);
