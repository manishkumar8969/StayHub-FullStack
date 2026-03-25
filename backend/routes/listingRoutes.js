const express = require('express');
const router = express.Router();
const { getAllListings, getListingById, createListing, updateListing, deleteListing } = require('../controllers/listingController');

router.get('/', getAllListings);
router.post('/', createListing);
router.get('/:id', getListingById);     // Individual view route
router.put('/:id', updateListing);      // Update route
router.delete('/:id', deleteListing);   // Delete route

module.exports = router;