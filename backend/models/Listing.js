const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    comment: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

const listingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1350&q=80" },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    country: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Naya Field: Reviews ka array
    reviews: [reviewSchema]
}, { timestamps: true });

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;