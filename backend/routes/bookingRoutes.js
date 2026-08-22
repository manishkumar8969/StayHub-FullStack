const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Inventory = require('../models/Inventory');
const Room = require('../models/Room');
const Listing = require('../models/Listing');
const User = require('../models/User'); // 👈 User import for email address
const { sendBookingConfirmationEmail } = require('../utils/invoiceService'); // 👈 Invoice & Email service

// 1. Nayi Booking Create Karne Ka Safe Route
router.post('/create', async (req, res) => {
    try {
        const { hotelId, roomId, userId, checkInDate, checkOutDate, totalPrice, guests } = req.body;

        if (!hotelId || !userId || !checkInDate || !checkOutDate) {
            return res.status(400).json({ message: "Missing required booking details." });
        }

        let start = new Date(checkInDate);
        let end = new Date(checkOutDate);

        let totalRoomCount = 5;
        try {
            const roomData = await Room.findById(roomId);
            if (roomData && roomData.totalCount) {
                totalRoomCount = roomData.totalCount;
            }
        } catch (e) {
            console.log("Using default room capacity logic.");
        }

        // Check Inventory availability for dates
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];

            const inv = await Inventory.findOne({ roomId, date: dateStr });
            if (inv && inv.bookedCount >= inv.totalCount) {
                return res.status(400).json({ message: `Sorry, property is fully booked on ${dateStr}` });
            }
        }

        // Save New Booking Document
        const newBooking = new Booking({
            hotelId,
            roomId,
            userId,
            checkInDate: start,
            checkOutDate: end,
            totalPrice: totalPrice || 0,
            status: 'Confirmed',
            guests: guests || []
        });

        await newBooking.save();

        // Update Inventory Database
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];

            await Inventory.findOneAndUpdate(
                { roomId, date: dateStr },
                { 
                    $inc: { bookedCount: 1 },
                    $setOnInsert: { hotelId, totalCount: totalRoomCount, closed: false }
                },
                { upsert: true, new: true }
            );
        }

        // ✉️ Trigger Automated PDF Invoice Email (Async - Non Blocking)
        try {
            const guestUser = await User.findById(userId);
            const stayListing = await Listing.findById(hotelId);
            if (guestUser && guestUser.email) {
                sendBookingConfirmationEmail(newBooking, guestUser, stayListing || {});
            }
        } catch (mailErr) {
            console.error("Mail trigger error:", mailErr.message);
        }

        res.status(201).json({ message: 'Booking successful!', booking: newBooking });

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ message: 'Server error during booking', error: error.message });
    }
});

// 2. User Ki Saari Bookings Fetch Karne Ka Route
router.get('/user/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId })
            .populate('hotelId', 'title location country image images price')
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
});

// 3. Booking Cancellation & Inventory Release Route
router.put('/cancel/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: "Booking is already cancelled" });
        }

        booking.status = 'Cancelled';
        await booking.save();

        // Inventory release: booked dates par bookedCount decrement karein
        if (booking.roomId && booking.checkInDate && booking.checkOutDate) {
            let start = new Date(booking.checkInDate);
            let end = new Date(booking.checkOutDate);

            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];

                await Inventory.findOneAndUpdate(
                    { roomId: booking.roomId, date: dateStr, bookedCount: { $gt: 0 } },
                    { $inc: { bookedCount: -1 } }
                );
            }
        }

        res.status(200).json({ 
            message: 'Booking cancelled and dates released successfully!', 
            booking 
        });

    } catch (error) {
        console.error("Cancel Booking Error:", error);
        res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
});

module.exports = router;