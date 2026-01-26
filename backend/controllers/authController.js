const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'User does not exist' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

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
