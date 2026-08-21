const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const https = require('https');
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
const bookingRoutes = require('./routes/bookingRoutes');
const aiRoutes = require('./routes/aiRoutes');

// API Routes Setup
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);

// Health-Check / Ping Endpoint for Keep-Alive
app.get('/api/ping', (req, res) => {
    res.status(200).send('StayHub Server Active 🚀');
});

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Self-KeepAlive Ping Loop (Har 10 minute me server ko wake rakhega)
    const APP_URL = process.env.RENDER_EXTERNAL_URL || 'https://stayhub-56pz.onrender.com';
    setInterval(() => {
        https.get(`${APP_URL}/api/ping`, (res) => {
            console.log(`[Keep-Alive] Pinged server: Status ${res.statusCode}`);
        }).on('error', (err) => {
            console.error('[Keep-Alive] Ping failed:', err.message);
        });
    }, 10 * 60 * 1000);
});