// backend/controllers/listingController.js
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const User = require('../models/User'); // 👈 User model import
const { sendBookingConfirmationEmail } = require('../utils/invoiceService'); // 👈 Invoice service import
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const Razorpay = require('razorpay');
const crypto = require('crypto');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Safe Razorpay Instance Initialization
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TL0826zhtIxXW7',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'IzXiBTojT4R6btYIGWha1qXm'
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

// 🔥 DYNAMIC TRENDING SORTED LISTINGS
const getAllListings = async (req, res) => {
    try {
        const { location, category, amenity } = req.query;
        let query = {};

        if (location) query.location = new RegExp(location, 'i');
        if (amenity) query.amenities = new RegExp(amenity, 'i');

        if (category && category.toLowerCase() === 'trending') {
            const listingsWithBookingCount = await Listing.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: 'bookings',
                        localField: '_id',
                        foreignField: 'hotelId',
                        as: 'allBookings'
                    }
                },
                {
                    $addFields: {
                        bookingCount: { $size: '$allBookings' }
                    }
                },
                {
                    $sort: { 
                        bookingCount: -1,
                        createdAt: -1
                    }
                },
                {
                    $project: { allBookings: 0 }
                }
            ]);

            return res.status(200).json(listingsWithBookingCount);
        }

        if (category) query.category = new RegExp(category, 'i');

        const listings = await Listing.find(query).sort({ createdAt: -1 });
        res.status(200).json(listings);
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
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

const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        if (String(listing.owner) !== String(req.user.id)) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        let finalImages = listing.images;
        if (req.body.existingImages) {
            try {
                const parsedExisting = JSON.parse(req.body.existingImages);
                if (Array.isArray(parsedExisting)) {
                    finalImages = parsedExisting.filter(url => url && typeof url === 'string' && url.trim() !== "");
                }
            } catch (e) {
                // fallback to current images
            }
        }

        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
            const newUploadedUrls = await Promise.all(uploadPromises);
            finalImages = [...finalImages, ...newUploadedUrls];
        }

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

// 💳 CREATE RAZORPAY ORDER
const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: Number(amount) * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        
        res.status(200).json({ 
            success: true, 
            order,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_TL0826zhtIxXW7'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 💳 VERIFY RAZORPAY PAYMENT & SAVE BOOKING + SEND PDF INVOICE
const verifyRazorpayPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            bookingData 
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const secretKey = process.env.RAZORPAY_KEY_SECRET || 'IzXiBTojT4R6btYIGWha1qXm';
        
        const expectedSignature = crypto
            .createHmac("sha256", secretKey)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            const currentUserId = req.user.id || req.user._id || bookingData.userId;

            const newBooking = await Booking.create({
                hotelId: bookingData.hotelId || req.params.id,
                roomId: bookingData.roomId || req.params.id,
                userId: currentUserId,
                checkInDate: bookingData.checkInDate,
                checkOutDate: bookingData.checkOutDate,
                totalPrice: bookingData.totalPrice,
                guests: bookingData.guests || [],
                status: 'Confirmed',
                paymentId: razorpay_payment_id
            });

            // ✉️ Send Automated Invoice Email
            (async () => {
                try {
                    const guestUser = await User.findById(currentUserId);
                    const stayListing = await Listing.findById(req.params.id);

                    if (guestUser && guestUser.email) {
                        console.log(`[Invoice] Sending booking invoice to: ${guestUser.email}`);
                        await sendBookingConfirmationEmail(newBooking, guestUser, stayListing || {});
                    } else {
                        console.warn('[Invoice] User email not found for ID:', currentUserId);
                    }
                } catch (mailErr) {
                    console.error("[Invoice Dispatch Error]:", mailErr.message);
                }
            })();

            return res.status(201).json({ 
                success: true, 
                message: "Payment verified and booking confirmed!", 
                booking: newBooking 
            });
        } else {
            return res.status(400).json({ success: false, message: "Invalid payment signature!" });
        }
    } catch (error) {
        console.error("Razorpay verification error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    getAllListings, 
    getListingById, 
    createListing, 
    updateListing, 
    deleteListing, 
    addReview, 
    bookListing, 
    getUserBookings,
    createRazorpayOrder,
    verifyRazorpayPayment
};