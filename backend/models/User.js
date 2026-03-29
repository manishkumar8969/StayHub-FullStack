const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });

// Password save karne se pehle usey encrypt (hash) karna
userSchema.pre('save', async function() {
    // Agar password change nahi hua toh kuch mat karo
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // Note: Async function mein 'next()' likhne ki zaroorat nahi hoti
});

module.exports = mongoose.model('User', userSchema);