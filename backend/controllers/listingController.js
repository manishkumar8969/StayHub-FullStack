const Listing = require('../models/Listing');

// 1. Saare listings dekhne ke liye (Read)
const getAllListings = async (req, res) => {
    try {
        const listings = await Listing.find({}).sort({ createdAt: -1 }); // Naya pehle dikhega
        res.status(200).json(listings);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 2. Single listing dekhne ke liye (Individual View)
const getListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: "Listing not found" });
        res.status(200).json(listing);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 3. Naya listing banana (Create)
const createListing = async (req, res) => {
    try {
        const newListing = await Listing.create(req.body);
        res.status(201).json(newListing);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// 4. Listing update karna (Update)
const updateListing = async (req, res) => {
    try {
        const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// 5. Listing delete karna (Delete)
const deleteListing = async (req, res) => {
    try {
        await Listing.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAllListings, getListingById, createListing, updateListing, deleteListing };