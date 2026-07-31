// backend/models/Listing.js
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    // Array of Strings for multiple URLs
    images: { 
        type: [String], 
        default: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60"] 
    },
    price: { type: Number, required: true },
    location: String,
    country: String,
    category: { type: String, default: 'Trending' },
    amenities: {
        type: [String],
        default: [] // e.g. ["wifi", "pool", "ac", "kitchen", "tv"]
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviews: [
        {
            rating: Number,
            comment: String,
            author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);