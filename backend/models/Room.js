const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    type: { type: String, required: true }, // e.g., Deluxe, Luxury, Standard
    basePrice: { type: Number, required: true },
    capacity: { type: Number, required: true }, // Kitne log ruk sakte hain
    totalCount: { type: Number, required: true }, // Total kitne kamre hain is type ke
    amenities: [String],
    photos: [String]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);