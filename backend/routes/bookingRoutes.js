const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Inventory = require('../models/Inventory');
const Room = require('../models/Room');
const Listing = require('../models/Listing');
const User = require('../models/User'); 
const { sendBookingConfirmationEmail } = require('../utils/invoiceService'); 

// 🧪 0. Instant Test Email Route
router.get('/test-email', async (req, res) => {
    try {
        const testUser = { 
            email: process.env.EMAIL_USER, 
            username: "Admin Tester", 
            name: "Admin Tester" 
        };
        const testBooking = { 
            _id: "66c5f77889abcdef12345678", 
            checkInDate: new Date(), 
            checkOutDate: new Date(Date.now() + 86400000), 
            totalPrice: 4999 
        };
        const testListing = { 
            title: "StayHub Luxury Beach Villa", 
            location: "Goa", 
            country: "India" 
        };

        console.log(`[Test Email] Dispatching test email to: ${process.env.EMAIL_USER}`);
        await sendBookingConfirmationEmail(testBooking, testUser, testListing);

        res.status(200).send(`
            <div style="font-family: Arial; padding: 30px; text-align: center;">
                <h2 style="color: #28a745;">✅ Test Email Dispatched!</h2>
                <p>Invoice email sent to: <b>${process.env.EMAIL_USER}</b></p>
                <p>Please check your Gmail <b>Inbox</b> and <b>Spam folder</b>.</p>
            </div>
        `);
    } catch (err) {
        console.error("[Test Email Error]:", err);
        res.status(500).send(`<h3>Failed to send test email: ${err.message}</h3>`);
    }
});

// 1. Nayi Booking Create Route (With Full User Email Resolution)
router.post('/create', async (req, res) => {
    try {
        const { hotelId, roomId, userId, checkInDate, checkOutDate, totalPrice, guests, email, userEmail } = req.body;

        console.log("[Booking Received]:", { hotelId, userId, checkInDate, checkOutDate, totalPrice });

        if (!hotelId || !checkInDate || !checkOutDate) {
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

        // Check Inventory availability
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];

            const inv = await Inventory.findOne({ roomId, date: dateStr });
            if (inv && inv.bookedCount >= inv.totalCount) {
                return res.status(400).json({ message: `Sorry, property is fully booked on ${dateStr}` });
            }
        }

        // Save Booking Document
        const newBooking = new Booking({
            hotelId,
            roomId,
            userId: userId || req.body.id || req.body._id,
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

        // ✉️ Dynamic Email Resolution & Trigger
        (async () => {
            try {
                const targetUserId = userId || req.body.id || req.body._id;
                let guestUser = null;

                if (targetUserId) {
                    guestUser = await User.findById(targetUserId);
                }

                // Fallback email checks
                const resolvedEmail = guestUser?.email 
                    || email 
                    || userEmail 
                    || (guests && guests[0]?.email);

                const resolvedName = guestUser?.username 
                    || guestUser?.name 
                    || (guests && guests[0]?.name) 
                    || 'Valued Guest';

                const stayListing = await Listing.findById(hotelId);

                if (resolvedEmail) {
                    console.log(`[Invoice] Sending confirmation PDF to: ${resolvedEmail}`);
                    await sendBookingConfirmationEmail(
                        newBooking, 
                        { email: resolvedEmail, name: resolvedName, username: resolvedName }, 
                        stayListing || {}
                    );
                } else {
                    console.warn('[Invoice] No email found in User DB, Request body or Guests.');
                }
            } catch (mailErr) {
                console.error("[Invoice Dispatch Error]:", mailErr.message);
            }
        })();

        res.status(201).json({ message: 'Booking successful!', booking: newBooking });

    } catch (error) {
        console.error("[Booking Error]:", error);
        res.status(500).json({ message: 'Server error during booking', error: error.message });
    }
});

// 2. User Ki Saari Bookings Fetch Route
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

// 3. Booking Cancellation Route
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
        console.error("[Cancel Booking Error]:", error);
        res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
});

module.exports = router;