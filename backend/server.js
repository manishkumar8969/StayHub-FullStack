
const express = require('express'); // Express ko bulaya
const dotenv = require('dotenv');   // Secret files padhne ke liye
const cors = require('cors'); 
const colors = require('colors'); 
const connectDB = require('./config/db');     // Frontend-Backend dosti ke liye

// 1. Config: .env file ko load karna
dotenv.config();

connectDB();

const listingRoutes = require('./routes/listingRoutes');

// 2. Initialize: App banana
const app = express();

// 3. Middlewares: Data format samjhne ke liye
app.use(express.json()); // JSON data handle karne ke liye
app.use(cors());         // Cross-origin access allow karne ke liye


// Routes Middleware
app.use('/api/listings', listingRoutes);

// 4. Basic Route: Check karne ke liye ki server chal raha hai
app.get('/', (req, res) => {
    res.send("StayHub Server is Running... 🚀");
});


const Listing = require('./models/Listing'); // Model ko import karein

// Test Route: Database mein data save karne ke liye
app.get('/test-listing', async (req, res) => {
    try {
        const sampleListing = new Listing({
            title: "My New Villa",
            description: "Beautiful beach side villa",
            price: 1200,
            location: "Goa",
            country: "India",
        });

        await sampleListing.save();
        res.send("Success: Sample Listing Saved!");
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});



// 5. Listen: Server ko start karna
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});