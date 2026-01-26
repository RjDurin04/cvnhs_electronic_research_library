const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure Multer Storage
const baseDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
const paperStoragePath = path.join(baseDataPath, 'cvnhs_electronic_research_library', 'cvnhs_research_papers');

// Ensure directory exists
if (!fs.existsSync(paperStoragePath)) {
    fs.mkdirSync(paperStoragePath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, paperStoragePath);
    },
    filename: (req, file, cb) => {
        // We expect 'title' to be in the body. NOTE: Frontend must send 'title' BEFORE 'pdf' in FormData.
        const title = req.body.title || 'Untitled';
        const sanitizedTitle = title.replace(/[^a-zA-Z0-9 ]/g, "").trim(); // Remove special chars
        const filename = `${sanitizedTitle}.pdf`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

module.exports = { upload, paperStoragePath };
