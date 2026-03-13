const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { logActivity } = require('../middleware/loggerMiddleware');

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, password, full_name, role, hasPermission } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // For admin and editor, hasPermission is inherently true. For viewer, use provided value or default to false.
        const assignedRole = role || 'viewer';
        const finalHasPermission = (assignedRole === 'admin' || assignedRole === 'editor') ? true : (typeof hasPermission === 'boolean' ? hasPermission : false);

        const newUser = new User({
            username,
            password: hashedPassword,
            full_name,
            role: assignedRole,
            hasPermission: finalHasPermission,
            permissionGrantedAt: finalHasPermission ? new Date() : null
        });

        await newUser.save();

        const userObj = newUser.toObject();
        delete userObj.password;

        await logActivity(req, 'Added User', full_name, `Account created with '${role || 'viewer'}' role`);

        res.status(201).json(userObj);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, username, role, password, currentPassword, hasPermission } = req.body;

        const isSelf = req.session.user.id === id;
        const isAdmin = req.session.user.role === 'admin';

        if (!isSelf && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this account.' });
        }

        if (currentPassword) {
            const changingUser = await User.findById(req.session.user.id);
            if (!changingUser) return res.status(401).json({ message: 'Unauthorized' });

            const isMatch = await bcrypt.compare(currentPassword, changingUser.password);
            if (!isMatch) {
                return res.status(403).json({ message: 'Incorrect current password' });
            }
        }

        const userToUpdate = await User.findById(id);
        if (!userToUpdate) return res.status(404).json({ message: 'User not found' });

        const originalName = userToUpdate.full_name;
        let changes = [];

        if (isSelf) {
            if (full_name && full_name !== userToUpdate.full_name) {
                userToUpdate.full_name = full_name;
                changes.push('Full Name');
            }
            if (username && username !== userToUpdate.username) {
                const existing = await User.findOne({ username });
                if (existing) return res.status(400).json({ message: 'Username taken' });
                userToUpdate.username = username;
                changes.push('Username');
            }
            if (role && role !== userToUpdate.role) {
                userToUpdate.role = role;
                changes.push('Role');
            }
            if (password) {
                const salt = await bcrypt.genSalt(10);
                userToUpdate.password = await bcrypt.hash(password, salt);
                changes.push('Password');
            }
        } else if (isAdmin) {
            if (full_name && full_name !== userToUpdate.full_name) {
                userToUpdate.full_name = full_name;
                changes.push('Full Name');
            }
        }

        // Handle hasPermission update (can be updated safely by self if self is admin/editor, or by admin)
        // Only admin can change this for *other* users, but for admins/editors it's always true.
        if (typeof hasPermission === 'boolean') {
            const effectiveRole = role || userToUpdate.role;
            const newPermission = (effectiveRole === 'admin' || effectiveRole === 'editor') ? true : hasPermission;
            if (userToUpdate.hasPermission !== newPermission) {
                const wasGranted = userToUpdate.hasPermission === true && newPermission === false;
                const grantedAt = userToUpdate.permissionGrantedAt;

                userToUpdate.hasPermission = newPermission;
                userToUpdate.permissionGrantedAt = newPermission ? new Date() : null;

                if (wasGranted && grantedAt) {
                    const durationMs = Date.now() - new Date(grantedAt).getTime();
                    const minutes = Math.floor(durationMs / 60000);
                    changes.push(`Permission Revoked (Access Duration: ${minutes}m)`);
                } else {
                    if (!changes.includes('Permission')) changes.push('Permission');
                }
            }
        } else {
            // Re-evaluate if role changed and no explicit hasPermission came through
            const effectiveRole = role || userToUpdate.role;
            if (effectiveRole === 'admin' || effectiveRole === 'editor') {
                if (userToUpdate.hasPermission !== true) {
                    userToUpdate.hasPermission = true;
                    userToUpdate.permissionGrantedAt = new Date();
                    if (!changes.includes('Permission')) changes.push('Permission');
                }
            }
        }

        if (changes.length > 0) {
            await userToUpdate.save();
            const logAction = isSelf ? 'Updated Profile' : 'Edited User Account';
            const logDetails = `Modified: ${changes.join(', ')}`;
            await logActivity(req, logAction, isSelf ? 'Self' : originalName, logDetails);
        }

        res.json({
            message: 'User updated successfully',
            user: {
                id: userToUpdate._id,
                username: userToUpdate.username,
                full_name: userToUpdate.full_name,
                role: userToUpdate.role,
                hasPermission: userToUpdate.hasPermission
            }
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const sessionUserId = req.session.user.id.toString();
        const targetId = id.toString();

        const isSelf = sessionUserId === targetId;
        const isAdmin = req.session.user.role === 'admin';

        // 1. Authorization
        if (!isSelf && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // 2. Target Check
        const userToDelete = await User.findById(targetId);
        if (!userToDelete) return res.status(404).json({ message: 'User not found' });

        // 3. Password Verification (Removed based on user request)
        /*
        if (!currentPassword) {
            return res.status(400).json({ message: 'Password verification required' });
        }

        const verifyingUser = await User.findById(req.session.user.id);
        const isMatch = await bcrypt.compare(currentPassword, verifyingUser.password);
        if (!isMatch) {
            return res.status(403).json({ message: 'Incorrect password' });
        }
        */

        // 4. Last Admin Protection
        if (userToDelete.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the only administrator account' });
            }
        }

        // 5. Execution
        await User.findByIdAndDelete(targetId);

        // 6. Cleanup
        if (mongoose.connection.db) {
            const sessionsCollection = mongoose.connection.db.collection('sessions');
            await sessionsCollection.deleteMany({
                'session': { $regex: `"id":"${targetId}"` }
            });
        } else {
            console.warn('Mongoose connection DB not available for session cleanup');
        }

        await logActivity(req, 'Deleted User', userToDelete.full_name, isSelf ? 'Self-deletion' : 'Administrative deletion');

        if (isSelf) {
            req.session.destroy();
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

const getActiveSessionUsers = async (req, res) => {
    try {
        const sessionsCollection = mongoose.connection.db.collection('sessions');
        const sessions = await sessionsCollection.find({}).toArray();

        const activeUserIds = new Set();
        sessions.forEach(sess => {
            try {
                const sessionData = JSON.parse(sess.session);
                if (sessionData.user && sessionData.user.id) {
                    activeUserIds.add(String(sessionData.user.id));
                }
            } catch (e) {
                console.error('Error parsing session:', e.message);
            }
        });

        res.json([...activeUserIds]);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ message: 'Error fetching sessions' });
    }
};

const kickUser = async (req, res) => {
    try {
        const { id } = req.params;
        const sessionsCollection = mongoose.connection.db.collection('sessions');

        const candidateSessions = await sessionsCollection.find({
            'session': { $regex: id }
        }).toArray();

        const sessionIdsToDelete = [];

        candidateSessions.forEach(sess => {
            try {
                const sessionData = JSON.parse(sess.session);
                if (sessionData.user && String(sessionData.user.id) === id) {
                    sessionIdsToDelete.push(sess._id);
                }
            } catch (e) {
                // ignore parse errors
            }
        });

        let deletedCount = 0;
        if (sessionIdsToDelete.length > 0) {
            const result = await sessionsCollection.deleteMany({
                _id: { $in: sessionIdsToDelete }
            });
            deletedCount = result.deletedCount;
        }

        const kickedUser = await User.findById(id);
        const targetName = kickedUser ? kickedUser.full_name : `User ID: ${id}`;
        await logActivity(req, 'Kicked User', targetName, 'Administrative session termination');

        res.json({ message: 'User kicked successfully', deletedCount });

    } catch (error) {
        console.error('Error kicking user:', error);
        res.status(500).json({ message: 'Error kicking user' });
    }
};

const updateBulkPermission = async (req, res) => {
    try {
        const { userIds, hasPermission } = req.body;

        if (!Array.isArray(userIds) || typeof hasPermission !== 'boolean') {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        if (userIds.length === 0) {
            return res.status(400).json({ message: 'No users selected' });
        }

        // Fetch users BEFORE update if revoking to record durations
        let usersBeforeUpdate = [];
        if (!hasPermission) {
            usersBeforeUpdate = await User.find({ _id: { $in: userIds }, role: 'viewer', hasPermission: true });
        }

        // Only allow updating viewer accounts
        const updateData = { $set: { hasPermission } };
        if (hasPermission) {
            updateData.$set.permissionGrantedAt = new Date();
        } else {
            updateData.$set.permissionGrantedAt = null;
        }

        const result = await User.updateMany(
            { _id: { $in: userIds }, role: 'viewer' },
            updateData
        );

        if (result.matchedCount > 0) {
            let action = hasPermission ? 'GRANTED BULK ACCESS' : 'REVOKED BULK ACCESS';
            let target = 'Multiple Users';
            let details = `Updated document access for ${result.matchedCount} viewer(s)`;

            if (!hasPermission && usersBeforeUpdate.length > 0) {
                // For revocation, record the final durations in the log
                const now = Date.now();
                const summaries = usersBeforeUpdate.map(u => {
                    const start = new Date(u.permissionGrantedAt).getTime();
                    const diff = Math.max(0, now - start);
                    const mins = Math.floor(diff / 60000);
                    return `${u.full_name} (${mins}m)`;
                });

                if (usersBeforeUpdate.length === 1) {
                    action = 'PERMISSION REVOKED';
                    target = usersBeforeUpdate[0].full_name;
                    const durationText = summaries[0].split('(')[1].replace(')', '');
                    details = `Revoked document access for viewer: ${usersBeforeUpdate[0].username}. Final Duration: ${durationText}`;
                } else {
                    details = `Revoked access for ${usersBeforeUpdate.length} viewer(s). Final Durations: ${summaries.join(', ')}`;
                }
            } else if (hasPermission && result.matchedCount === 1) {
                // If granting to just one user, log their name specifically
                const updatedUser = await User.findOne({ _id: { $in: userIds }, role: 'viewer' });
                if (updatedUser) {
                    action = 'PERMISSION GRANTED';
                    target = updatedUser.full_name;
                    details = `Granted document access for viewer: ${updatedUser.username}`;
                }
            }

            await logActivity(req, action, target, details);
        }

        res.json({
            message: 'Bulk permissions updated successfully',
            updatedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('Error updating bulk permissions:', error);
        res.status(500).json({ message: 'Error updating bulk permissions' });
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, getActiveSessionUsers, kickUser, updateBulkPermission };
