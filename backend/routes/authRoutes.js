const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const { login, logout, getMe, reportSessionExpiry } = require('../controllers/authController');

const { validate, loginValidation } = require('../middleware/validationMiddleware');

router.post('/login', validate(loginValidation), login);
router.post('/report-expiry', reportSessionExpiry);

// The following routes require authentication
router.use(isAuthenticated);
router.post('/logout', logout);
router.get('/me', getMe);

module.exports = router;
