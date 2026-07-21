// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Inventory = require('../models/Inventory');
const Room = require('../models/Room');
const Listing = require('../models/Listing');

// 1. Nayi Booking Create Karne Ka Safe Route
router.post('/create', async (req, res) => {
    try {
        const { hotelId, roomId, userId, checkInDate, checkOutDate, totalPrice, guests } = req.body;

        if (!hotelId || !userId || !checkInDate || !checkOutDate) {
            return res.status(400).json({ message: "Missing required booking details." });
        }

        // Dates ko parse karein
        let start = new Date(checkInDate);
        let end = new Date(checkOutDate);

        // Dates loop run karne se pehle Total Capacity Fallback set karein
        let totalRoomCount = 5; // Default 5 rooms per property if Room collection is empty
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
            .populate('hotelId', 'title location image images price');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
});

module.exports = router;