const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. SIGNUP Logic (UPDATED: Auto-Login support ke saath)
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 1. Check karein ki user pehle se toh nahi hai
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists!" });

        // 2. Naya user banayein
        const newUser = new User({ username, email, password });
        
        // 3. Save karein (User model ka 'pre-save' trigger password hash kar dega)
        await newUser.save(); 

        // 4. 🔥 AUTO-LOGIN LOGIC: Registration ke turant baad Token generate karein
        const token = jwt.sign({ id: newUser._id }, "STAYHUB_SECRET_KEY", { expiresIn: '1d' });
        
        // 5. Token aur User info bhej dein
        res.status(201).json({ 
            message: "User registered successfully!",
            token, 
            user: { id: newUser._id, username: newUser.username } 
        });

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

        // Token banana
        const token = jwt.sign({ id: user._id }, "STAYHUB_SECRET_KEY", { expiresIn: '1d' });
        
        res.status(200).json({ token, user: { id: user._id, username: user.username } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login };