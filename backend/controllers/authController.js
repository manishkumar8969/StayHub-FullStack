const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. SIGNUP Logic
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Naya user banayein
        const newUser = new User({ username, email, password });
        
        // Save karein (Yahan User.js wala 'pre-save' trigger hoga)
        await newUser.save(); 
        
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.log("Signup Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// 2. LOGIN Logic
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials!" });

        // Token banana (Ye token user ki pehchan hogi)
        const token = jwt.sign({ id: user._id }, "STAYHUB_SECRET_KEY", { expiresIn: '1d' });
        
        res.status(200).json({ token, user: { id: user._id, username: user.username } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login };