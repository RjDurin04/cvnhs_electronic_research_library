const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const LoginAttempt = require('../models/LoginAttempt');

const login = async (req, res) => {
    const { username, password, deviceId } = req.body;

    if (!deviceId) {
        return res.status(400).json({ message: 'Device ID is required' });
    }

    try {
        const normalizedUsername = username.toLowerCase();

        // Check for existing login attempts
        let attemptRecord = await LoginAttempt.findOne({
            deviceId,
            username: normalizedUsername
        });

        const now = new Date();

        if (attemptRecord) {
            // 10-Minute Grace Period: Forget old mistakes
            const diffMs = now - attemptRecord.lastAttempt;
            if (diffMs > 10 * 60 * 1000) {
                attemptRecord.attempts = 0;
            }

            // The 3-Try Limit: 1-minute lockout
            if (attemptRecord.attempts >= 3 && diffMs < 60 * 1000) {
                const remainingSeconds = Math.ceil((60 * 1000 - diffMs) / 1000);
                return res.status(429).json({
                    message: `Too many attempts. Please try again in ${remainingSeconds}s`,
                    retryAfter: remainingSeconds
                });
            }
        }

        const user = await User.findOne({ username: normalizedUsername });

        const handleFailure = async () => {
            const newAttempts = (attemptRecord ? attemptRecord.attempts : 0) + 1;
            await LoginAttempt.findOneAndUpdate(
                { deviceId, username: normalizedUsername },
                {
                    attempts: newAttempts,
                    lastAttempt: now
                },
                { upsert: true, new: true }
            );
        };

        if (!user) {
            await handleFailure();
            return res.status(401).json({ message: 'User does not exist' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await handleFailure();
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Success Reset: Clear the slate
        await LoginAttempt.deleteOne({ deviceId, username: normalizedUsername });

        // Save session
        req.session.user = {
            id: user._id,
            username: user.username,
            full_name: user.full_name,
            role: user.role
        };

        // Log Login Activity
        try {
            const log = new ActivityLog({
                performedBy: user.full_name,
                actionType: 'Login',
                targetItem: user.full_name,
                changeDetails: 'Successful login'
            });
            await log.save();
        } catch (e) { console.error('Login log error', e); }

        res.json({
            message: 'Login successful',
            user: req.session.user
        });
    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const logout = (req, res) => {
    const userName = req.session.user ? req.session.user.full_name : 'Unknown';
    req.session.destroy(async (err) => {
        if (err) return res.status(500).json({ message: 'Error logging out' });

        if (userName !== 'Unknown') {
            try {
                const log = new ActivityLog({
                    performedBy: userName,
                    actionType: 'Logout',
                    targetItem: userName,
                    changeDetails: 'Manual session termination'
                });
                await log.save();
            } catch (e) { console.error('Logout log error', e); }
        }

        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
};

const getMe = (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
};

const reportSessionExpiry = async (req, res) => {
    const { username, full_name } = req.body;
    try {
        const log = new ActivityLog({
            performedBy: full_name || username || 'System',
            actionType: 'Logout',
            targetItem: full_name || username || 'Self',
            changeDetails: 'Session expired due to inactivity'
        });
        await log.save();
        res.json({ message: 'Expiry logged' });
    } catch (e) {
        console.error('Expiry log error', e);
        res.status(500).json({ message: 'Error logging expiry' });
    }
};

module.exports = { login, logout, getMe, reportSessionExpiry };
