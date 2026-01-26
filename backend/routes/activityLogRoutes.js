const express = require('express');
const router = express.Router();
const { isAuthenticated, permitIndex } = require('../middleware/authMiddleware');
const { getActivityLogs, deleteActivityLogs } = require('../controllers/activityLogController');

// All activity log routes are admin-only
router.use(isAuthenticated);
router.use(permitIndex(['admin']));

router.get('/', getActivityLogs);
router.delete('/', deleteActivityLogs);

module.exports = router;
