const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Dhyan dein: Ye naam wahi hone chahiye jo listingController.js mein module.exports mein hain
const { 
    getAllListings, 
    getListingById, 
    createListing, 
    updateListing, 
    deleteListing,
    addReview
} = require('../controllers/listingController');

// Routes
router.get('/', getAllListings); 
router.get('/:id', getListingById); 
router.post('/:id/reviews', protect, addReview);
router.post('/', protect, createListing); 
router.put('/:id', protect, updateListing); 
router.delete('/:id', protect, deleteListing); 

module.exports = router;