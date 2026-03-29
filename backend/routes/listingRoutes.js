const express = require('express');
const router = express.Router();
const { 
    getAllListings, 
    getListingById, 
    createListing, 
    updateListing, 
    deleteListing, 
    addReview, 
    bookListing, 
    getUserBookings // Import check karein
} = require('../controllers/listingController');

const { protect } = require('../middleware/auth');

// 1. Static/Specific Routes (Inhe Hamesha Upar Rakhein)
router.get('/', getAllListings);
router.get('/user/my-bookings', protect, getUserBookings); // <--- Ise :id se upar hona chahiye

// 2. Dynamic Routes (ID waale niche)
router.get('/:id', getListingById);
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

// 3. Action Routes
router.post('/:id/reviews', protect, addReview);
router.post('/:id/book', protect, bookListing);

module.exports = router;