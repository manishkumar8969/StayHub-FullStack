// backend/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    hotelId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Listing', 
        required: true 
    },
    roomId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Room', 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    checkInDate: { 
        type: Date, 
        required: true 
    },
    checkOutDate: { 
        type: Date, 
        required: true 
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Cancelled'], 
        default: 'Confirmed' 
    },
    paymentId: { 
        type: String 
    },
    guests: [{
        name: String,
        gender: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);