const express = require('express');
const router = express.Router();
const { isAuthenticated, permitIndex } = require('../middleware/authMiddleware');
const {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getActiveSessionUsers,
    kickUser
} = require('../controllers/userController');

// All routes here require authentication
router.use(isAuthenticated);

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Session management
router.get('/sessions', getActiveSessionUsers);
router.delete('/:id/sessions', kickUser);

module.exports = router;
