const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Hashed password will be longer, but validation before hash is useful
    },
    full_name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'viewer'],
        default: 'viewer'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

const User = mongoose.model('User', userSchema);

module.exports = User;
