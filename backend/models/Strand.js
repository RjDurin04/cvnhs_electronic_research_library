const mongoose = require('mongoose');

const strandSchema = new mongoose.Schema({
    short: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        default: 'BookOpen',
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Strand', strandSchema);
