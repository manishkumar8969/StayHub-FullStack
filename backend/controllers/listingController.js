// backend/controllers/listingController.js
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream({ folder: "StayHub_Uploads" }, (error, result) => {
            if (result) resolve(result.secure_url);
            else reject(error);
        });
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

// Helper: Safety parse amenities coming from frontend form
const parseAmenities = (amenitiesData) => {
    if (!amenitiesData) return [];
    if (Array.isArray(amenitiesData)) return amenitiesData;
    if (typeof amenitiesData === 'string') {
        try {
            const parsed = JSON.parse(amenitiesData);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            return amenitiesData.split(',').map(item => item.trim().toLowerCase());
        }
        return [amenitiesData.toLowerCase()];
    }
    return [];
};

const getAllListings = async (req, res) => {
    try {
        const { location, category, amenity } = req.query;
        let query = {};

        if (location) query.location = new RegExp(location, 'i');
        if (category) query.category = new RegExp(category, 'i');
        if (amenity) query.amenities = new RegExp(amenity, 'i');

        const listings = await Listing.find(query).sort({ createdAt: -1 });
        res.status(200).json(listings);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate('owner', 'username').populate('reviews.author', 'username');
        res.status(200).json(listing);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createListing = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) return res.status(400).json({ message: "Upload at least one image!" });

        const uploadPromises = files.map(file => uploadToCloudinary(file.buffer));
        const uploadedUrls = await Promise.all(uploadPromises);

        // Parse amenities safely
        const formattedAmenities = parseAmenities(req.body.amenities);

        const newListing = new Listing({ 
            ...req.body, 
            amenities: formattedAmenities,
            images: uploadedUrls, 
            owner: req.user.id 
        });
        
        await newListing.save();
        res.status(201).json(newListing);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// 🎯 SAFE UPDATED FUNCTION
const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        if (String(listing.owner) !== String(req.user.id)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // 1. Existing text URLs logic (agar frontend se rearrange/edit karke bheja gaya ho)
        let finalImages = listing.images;
        if (req.body.existingImages) {
            try {
                const parsedExisting = JSON.parse(req.body.existingImages);
                if (Array.isArray(parsedExisting)) {
                    finalImages = parsedExisting.filter(url => url && typeof url === 'string' && url.trim() !== "");
                }
            } catch (e) {
                // Ignore parse error, fallback to current images
            }
        }

        // 2. Direct device files upload logic (agar nayi photos select ki ho)
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
            const newUploadedUrls = await Promise.all(uploadPromises);
            finalImages = [...finalImages, ...newUploadedUrls];
        }

        // 3. Format Amenities
        const formattedAmenities = req.body.amenities ? parseAmenities(req.body.amenities) : listing.amenities;

        const updated = await Listing.findByIdAndUpdate(
            req.params.id, 
            { 
                ...req.body, 
                amenities: formattedAmenities, 
                images: finalImages 
            }, 
            { new: true }
        );

        res.status(200).json(updated);
    } catch (error) { 
        res.status(400).json({ message: error.message }); 
    }
};

const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (String(listing.owner) !== String(req.user.id)) return res.status(401).json({ message: 'Not authorized' });
        await Listing.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const addReview = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        listing.reviews.push({ ...req.body, author: req.user.id });
        await listing.save();
        res.status(201).json({ message: 'Review added' });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const bookListing = async (req, res) => {
    try {
        const newBooking = await Booking.create({ ...req.body, listing: req.params.id, user: req.user.id });
        res.status(201).json(newBooking);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate('listing', 'title images location price'); 
        res.status(200).json(bookings);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAllListings, getListingById, createListing, updateListing, deleteListing, addReview, bookListing, getUserBookings };