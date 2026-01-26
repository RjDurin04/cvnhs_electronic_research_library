const ActivityLog = require('../models/ActivityLog');

// Helper function to log activity
const logActivity = async (req, actionType, targetItem, changeDetails = '') => {
    try {
        if (!req.session.user) return; // Should not happen if authenticated

        const log = new ActivityLog({
            performedBy: req.session.user.full_name,
            actionType,
            targetItem,
            changeDetails
        });
        await log.save();
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = { logActivity };
