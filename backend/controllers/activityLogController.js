const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../middleware/loggerMiddleware');

const getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ message: 'Error fetching logs' });
    }
};

const deleteActivityLogs = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No log IDs provided' });
        }

        const result = await ActivityLog.deleteMany({ _id: { $in: ids } });

        await logActivity(req, 'Deleted Logs', 'System', `Permanently removed ${result.deletedCount} activity logs`);

        res.json({ message: 'Logs deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error deleting activity logs:', error);
        res.status(500).json({ message: 'Error deleting logs' });
    }
};

module.exports = { getActivityLogs, deleteActivityLogs };
