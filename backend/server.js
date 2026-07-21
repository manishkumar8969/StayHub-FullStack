const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// 1. CORS Configuration
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// Routes Imports
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const bookingRoutes = require('./routes/bookingRoutes'); // 👈 Naya Booking Route import hua

// API Routes Setup
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes); // 👈 Naya Booking Route Endpoint connect hua

const PORT = process.env.PORT || 5000;

// Frontend static build serve karne ke liye
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Non-API requests ke liye React single page application serve karna
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));