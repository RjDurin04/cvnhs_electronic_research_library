const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    performedBy: {
        type: String, // Storing full name as string snapshot
        required: true
    },
    actionType: {
        type: String,
        required: true
    },
    targetItem: {
        type: String, // Storing title/name as string snapshot
        required: true
    },
    changeDetails: {
        type: String // Optional, for storing what changed
    }
});

// Auto-delete logs older than 1 year (optional, but good practice)
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
