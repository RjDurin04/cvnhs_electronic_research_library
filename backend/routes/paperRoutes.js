const express = require('express');
const router = express.Router();
const { isAuthenticated, permitIndex } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
    getPapers,
    getPaperById,
    viewPaper,
    downloadPaper,
    createPaper,
    updatePaper,
    deletePaper
} = require('../controllers/paperController');

// Public routes (must come first if conflicting with :id)
router.get('/view/:id', viewPaper);
router.get('/download/:id', downloadPaper);
router.get('/', getPapers);
router.get('/:id', getPaperById);

// Protected routes
router.post('/', isAuthenticated, upload.single('pdf'), createPaper);
router.put('/:id', isAuthenticated, upload.single('pdf'), updatePaper);
router.delete('/:id', isAuthenticated, permitIndex(['admin']), deletePaper);

module.exports = router;
