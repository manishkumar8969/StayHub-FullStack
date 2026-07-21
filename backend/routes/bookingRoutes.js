// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Inventory = require('../models/Inventory');
const Room = require('../models/Room');

// 1. Nayi Booking Create Karne Ka Route
router.post('/create', async (req, res) => {
    try {
        const { hotelId, roomId, userId, checkInDate, checkOutDate, guests } = req.body;

        // Dates ko loop chalane ke liye format karein
        let start = new Date(checkInDate);
        let end = new Date(checkOutDate);

        // Har ek din ke liye availability check karein
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];

            // Inventory check karein us date ke liye
            const inv = await Inventory.findOne({ roomId, date: dateStr });
            if (inv && inv.bookedCount >= inv.totalCount) {
                return res.status(400).json({ message: `Sorry, rooms are full on ${dateStr}` });
            }
        }

        // Agar saari dates available hain, toh booking save karein
        const newBooking = new Booking({
            hotelId,
            roomId,
            userId,
            checkInDate,
            checkOutDate,
            status: 'CONFIRMED', // Direct confirm kar rahe hain abhi ke liye
            guests
        });
        await newBooking.save();

        // Ab Inventory ko update karein (+1 bookedCount)
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            // Agar inventory entry pehle se hai toh update, nahi toh nayi banayein
            const roomData = await Room.findById(roomId);
            await Inventory.findOneAndUpdate(
                { roomId, date: dateStr },
                { 
                    $inc: { bookedCount: 1 },
                    $setOnInsert: { hotelId, totalCount: roomData.totalCount, closed: false }
                },
                { upsert: true, new: true }
            );
        }

        res.status(201).json({ message: 'Booking successful!', booking: newBooking });

    } catch (error) {
        res.status(500).json({ message: 'Server error during booking', error: error.message });
    }
});

// 2. User Ki Saari Bookings Dekhne Ka Route
router.get('/user/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({ userId })
            .populate('hotelId', 'title location photos')
            .populate('roomId', 'type basePrice');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
});

module.exports = router;