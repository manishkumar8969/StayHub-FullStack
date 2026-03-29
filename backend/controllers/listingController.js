const Listing = require('../models/Listing');
const Booking = require('../models/Booking');

// 1. Saare listings dekhne ke liye + SEARCH & FILTER (Updated)
const getAllListings = async (req, res) => {
    try {
        const { location, category } = req.query;
        let query = {};

        // Agar location search ki gayi hai
        if (location) {
            query.location = { $regex: location, $options: 'i' }; // 'i' matlab Case-Insensitive (Chota-bada letter sab chalega)
        }

        // Agar category filter select kiya gaya hai
        if (category && category !== "Trending") {
            query.description = { $regex: category, $options: 'i' }; 
            // Note: Abhi hum description mein se dhoond rahe hain, baad mein Category field add kar sakte hain.
        }

        const listings = await Listing.find(query).sort({ createdAt: -1 });
        res.status(200).json(listings);
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};

// Baaki functions (getListingById, createListing, etc.) same rahenge...
// ... (Copy from your existing file)

// 2. Single listing dekhne ke liye (Individual View)
const getListingById = async (req, res) => {
    try {
        // .populate('owner', 'username email') se humein owner ka naam bhi mil jayega
        const listing = await Listing.findById(req.params.id).populate('owner', 'username email');
        if (!listing) return res.status(404).json({ message: "Listing not found" });
        res.status(200).json(listing);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 3. Naya listing banana (Create) - UPDATED 🛡️
const createListing = async (req, res) => {
    try {
        // req.body ke saath owner ki ID bhi jod rahe hain (Jo Token se aayi hai)
        const listingData = { ...req.body, owner: req.user.id };
        const newListing = await Listing.create(listingData);
        res.status(201).json(newListing);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// 4. Listing update karna (Update) - PROTECTED 🔒
// Listing update karna
const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: "Listing not found" });

        if (listing.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: "You can only update your own listings!" });
        }

        // 'new: true' ki jagah 'returnDocument: "after"'
        const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        res.status(200).json(updated);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// 5. Listing delete karna (Delete) - PROTECTED 🔒
const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: "Stay not found" });

        // DEBUG LOGS (Ye terminal mein dikhenge)
        console.log("Owner ID in DB:", listing.owner.toString());
        console.log("User ID from Token:", req.user.id);

        if (listing.owner.toString() !== req.user.id) {
            return res.status(401).json({ 
                message: `Unauthorized! DB Owner: ${listing.owner}, Your ID: ${req.user.id}` 
            });
        }

        await Listing.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 6. Review add karne ke liye
const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const listing = await Listing.findById(req.params.id);

        if (!listing) return res.status(404).json({ message: "Stay not found" });

        const newReview = {
            rating,
            comment,
            author: req.user.id // Token se user ID le rahe hain
        };

        listing.reviews.push(newReview);
        await listing.save();

        // Populate karke wapas bhej rahe hain taaki author ka naam dikhe
        const updatedListing = await Listing.findById(req.params.id).populate('reviews.author', 'username');
        res.status(201).json(updatedListing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 7. NEW: Booking Listing Function
const bookListing = async (req, res) => {
    try {
        const { checkIn, checkOut, totalPrice } = req.body;
        const newBooking = await Booking.create({
            listing: req.params.id,
            user: req.user.id,
            checkIn,
            checkOut,
            totalPrice
        });
        res.status(201).json({ message: "Booking confirmed! 🎉", newBooking });
    } catch (error) { res.status(400).json({ message: error.message }); }
};


// 8. User ki saari bookings dikhane ke liye
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('listing', 'title image location price');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// module.exports mein 'addReview' ko bhi add karein
module.exports = { getAllListings, getListingById, createListing, updateListing, deleteListing, addReview, bookListing, getUserBookings };
