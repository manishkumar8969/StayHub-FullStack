const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// 1. Sabse upar CORS rakhein
app.use(cors({
    origin: "*", // Sabhi origins allow karne ke liye
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);

const PORT = process.env.PORT || 5000;

const path = require('path');

// Frontend ke built files ko serve karne ke liye
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Agar koi aisa route hit ho jo backend API nahi hai, toh React App serve karein
app.get('(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));