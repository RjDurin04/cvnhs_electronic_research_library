const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const { getStrands, createStrand, updateStrand, deleteStrand } = require('../controllers/strandController');

// Public route
router.get('/', getStrands);

// Protected routes
router.post('/', isAuthenticated, createStrand);
router.put('/:id', isAuthenticated, updateStrand);
router.delete('/:id', isAuthenticated, deleteStrand);

module.exports = router;
