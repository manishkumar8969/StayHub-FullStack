const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title hona zaroori hai'],
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String, // Yahan hum image ka URL save karenge
        default: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    price: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    }
}, { timestamps: true }); // Isse automatically 'CreatedAt' aur 'UpdatedAt' ban jayega

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;