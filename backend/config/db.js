
const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

// YAHAN DHAYAN DEIN: Ye line honi hi chahiye
module.exports = connectDB;