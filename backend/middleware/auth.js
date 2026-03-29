const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    // Browser ki Pre-flight (OPTIONS) request ko bypass karein
    if (req.method === 'OPTIONS') return next();

    const token = req.header('Authorization');
    console.log("--- Request Method:", req.method);
    console.log("--- Received Header:", token);

    if (!token) {
        console.log("Terminal Error: Token nahi mila!"); 
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, "STAYHUB_SECRET_KEY");
        req.user = decoded;
        next();
    } catch (err) {
        console.log("JWT Error:", err.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = { protect };