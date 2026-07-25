// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. SIGNUP Logic (UPDATED: Role Support ke saath)
const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        // 1. Check karein ki email pehle se toh nahi hai
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists!" });

        // 2. Naya user banayein (Role pass kar rahe hain: 'customer' ya 'host')
        const newUser = new User({ 
            username, 
            email, 
            password, 
            role: role || 'customer' // Agar frontend se role na aaye toh default 'customer'
        });
        
        // 3. Save karein (Pre-save hook password hash karega)
        await newUser.save(); 

        // 4. Token generate karein (JWT payload mein role bhi include kiya)
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role }, 
            "STAYHUB_SECRET_KEY", 
            { expiresIn: '1d' }
        );
        
        // 5. Response mein Role ke saath user data bhejen
        res.status(201).json({ 
            message: "User registered successfully!",
            token, 
            user: { 
                id: newUser._id, 
                username: newUser.username, 
                email: newUser.email,
                role: newUser.role 
            } 
        });

    } catch (error) {
        console.log("Signup Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// 2. LOGIN Logic (UPDATED: Role Support ke saath)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials!" });

        // Token banana
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            "STAYHUB_SECRET_KEY", 
            { expiresIn: '1d' }
        );
        
        res.status(200).json({ 
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                email: user.email,
                role: user.role || 'customer' 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login };