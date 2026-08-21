const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

// 1. Create Booking & Razorpay Order
const createBooking = async (req, res) => {
    try {
        const { listingId, checkIn, checkOut, totalPrice } = req.body;

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        const options = {
            amount: Math.round(totalPrice * 100),
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
        };

        const razorpayOrder = await razorpay.orders.create(options);

        const booking = new Booking({
            user: req.user._id,
            listing: listingId,
            checkIn,
            checkOut,
            totalPrice,
            paymentStatus: 'Pending',
            razorpayOrderId: razorpayOrder.id,
            status: 'Confirmed'
        });

        await booking.save();

        res.status(201).json({
            order: razorpayOrder,
            bookingId: booking._id
        });
    } catch (error) {
        console.error("Create Booking Error:", error);
        res.status(500).json({ message: "Error creating booking", error: error.message });
    }
};

// 2. Verify Razorpay Payment Signature
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            const booking = await Booking.findById(bookingId);
            if (booking) {
                booking.paymentStatus = 'Completed';
                booking.razorpayPaymentId = razorpay_payment_id;
                await booking.save();
            }
            return res.status(200).json({ message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ message: "Error verifying payment" });
    }
};

// 3. Get User Bookings
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('listing')
            .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Fetch Bookings Error:", error);
        res.status(500).json({ message: "Error fetching bookings" });
    }
};

// 4. Cancel Booking
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to cancel this booking" });
        }

        if (booking.status === "Cancelled") {
            return res.status(400).json({ message: "Booking is already cancelled" });
        }

        booking.status = "Cancelled";
        await booking.save();

        res.status(200).json({ 
            message: "Booking cancelled successfully", 
            booking 
        });
    } catch (error) {
        console.error("Cancel Booking Error:", error);
        res.status(500).json({ message: "Server error while cancelling booking" });
    }
};

module.exports = {
    createBooking,
    verifyPayment,
    getUserBookings,
    cancelBooking
};