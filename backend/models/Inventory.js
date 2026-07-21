const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    date: { type: Date, required: true },
    bookedCount: { type: Number, default: 0 }, // Us din kitne book hue
    totalCount: { type: Number, required: true },  // Us type ke total kitne rooms hain
    closed: { type: Boolean, default: false }      // Kya booking band hai us din?
});

// Ek unique index taaki ek room ki ek date ke liye ek hi entry bane
inventorySchema.index({ roomId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);