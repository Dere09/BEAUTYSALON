const mongoose = require('mongoose');

const customerRatingSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        index: true
    },
    salonId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure one rating per phone per salon
customerRatingSchema.index({ salonId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('CustomerRating', customerRatingSchema);
