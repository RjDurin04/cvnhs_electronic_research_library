const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    lastAttempt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for fast lookup of specific device/user combo
loginAttemptSchema.index({ deviceId: 1, username: 1 }, { unique: true });

const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);

module.exports = LoginAttempt;
