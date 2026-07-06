const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllListings, getListingById, createListing, updateListing, deleteListing, addReview, bookListing, getUserBookings } = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', getAllListings);
router.get('/user/my-bookings', protect, getUserBookings);
router.get('/:id', getListingById);

// 🔥 'images' wahi naam hona chahiye jo frontend bhejega
router.post('/', protect, upload.array('images', 5), createListing); 
router.put('/:id', protect, upload.array('images', 5), updateListing); 

router.delete('/:id', protect, deleteListing);
router.post('/:id/reviews', protect, addReview);
router.post('/:id/book', protect, bookListing);

module.exports = router;