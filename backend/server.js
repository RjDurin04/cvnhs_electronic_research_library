const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const User = require('./models/User');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8080'], // Allow both dev ports
    credentials: true
}));
app.use(express.json());

// Session Config
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Use .env for production
    resave: false,
    saveUninitialized: false,
    rolling: true, // Resets expiration on every request
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        secure: false, // Set true if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 15 // 15 minutes
    }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Seed Admin User
        try {
            const adminExists = await User.findOne({ username: 'admin' });
            if (!adminExists) {
                console.log('Admin user not found. Creating default admin...');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('admin', salt);

                const adminUser = new User({
                    username: 'admin',
                    password: hashedPassword,
                    full_name: 'System Admin',
                    role: 'admin'
                });

                await adminUser.save();
                console.log('Default admin user created successfully.');
            } else {
                console.log('Admin user already exists.');
            }
        } catch (error) {
            console.error('Error seeding admin user:', error);
        }
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Routes
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Save session
        req.session.user = {
            id: user._id,
            username: user.username,
            full_name: user.full_name,
            role: user.role
        };

        res.json({
            message: 'Login successful',
            user: req.session.user
        });
    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Error logging out' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

app.get('/api/auth/me', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// --- User Management Routes ---

// GET /api/users - List all users
app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// POST /api/users - Create new user
app.post('/api/users', isAuthenticated, async (req, res) => {
    try {
        const { username, password, full_name, role } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword,
            full_name,
            role: role || 'viewer'
        });

        await newUser.save();

        // Return user without password
        const userObj = newUser.toObject();
        delete userObj.password;

        res.status(201).json(userObj);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// PUT /api/users/:id - Update user
app.put('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, username, role, password, currentPassword } = req.body;

        // 1. Security Check: If a currentPassword is provided (mostly for admin updates or changing password), verify it.
        // We verify against the *currently logged in* user's password to authorize the action.
        if (currentPassword) {
            const changingAdmin = await User.findById(req.session.user.id);
            if (!changingAdmin) return res.status(401).json({ message: 'Unauthorized' });

            const isMatch = await bcrypt.compare(currentPassword, changingAdmin.password);
            if (!isMatch) {
                return res.status(403).json({ message: 'Incorrect current password' });
            }
        }

        const userToUpdate = await User.findById(id);
        if (!userToUpdate) return res.status(404).json({ message: 'User not found' });

        // Update fields
        if (full_name) userToUpdate.full_name = full_name;
        if (username) {
            // Check uniqueness if changing
            if (username !== userToUpdate.username) {
                const existing = await User.findOne({ username });
                if (existing) return res.status(400).json({ message: 'Username taken' });
                userToUpdate.username = username;
            }
        }
        if (role) userToUpdate.role = role;

        // Update password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            userToUpdate.password = await bcrypt.hash(password, salt);
        }

        await userToUpdate.save();

        res.json({
            message: 'User updated successfully', user: {
                id: userToUpdate._id,
                username: userToUpdate.username,
                full_name: userToUpdate.full_name,
                role: userToUpdate.role
            }
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

// DELETE /api/users/:id - Delete user
app.delete('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (id === req.session.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });

        // Also delete all sessions for this user
        const sessionsCollection = mongoose.connection.db.collection('sessions');
        await sessionsCollection.deleteMany({
            'session': { $regex: `"id":"${id}"` }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// GET /api/users/sessions - Get list of user IDs with active sessions
app.get('/api/users/sessions', isAuthenticated, async (req, res) => {
    try {
        const sessionsCollection = mongoose.connection.db.collection('sessions');
        const sessions = await sessionsCollection.find({}).toArray();

        // Extract unique user IDs from sessions
        const activeUserIds = new Set();
        sessions.forEach(sess => {
            try {
                const sessionData = JSON.parse(sess.session);
                if (sessionData.user && sessionData.user.id) {
                    // Convert to string in case it's an ObjectId
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
});

// DELETE /api/users/:id/sessions - Kick user (delete all their sessions)
// DELETE /api/users/:id/sessions - Kick user (delete all their sessions)
app.delete('/api/users/:id/sessions', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent kicking yourself
        if (id === req.session.user.id) {
            return res.status(400).json({ message: 'Cannot kick yourself' });
        }

        const sessionsCollection = mongoose.connection.db.collection('sessions');

        // rigorous approach: find candidate sessions first, then verify
        // This avoids brittle regex matching on JSON strings
        const candidateSessions = await sessionsCollection.find({
            'session': { $regex: id } // loose match to find potential sessions
        }).toArray();

        const sessionIdsToDelete = [];

        candidateSessions.forEach(sess => {
            try {
                const sessionData = JSON.parse(sess.session);
                // Verify strict equality of user ID
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

        res.json({ message: 'User kicked successfully', deletedCount });
    } catch (error) {
        console.error('Error kicking user:', error);
        res.status(500).json({ message: 'Error kicking user' });
    }
});



// Routes for Strands
const Strand = require('./models/Strand');

// GET /api/strands - Get all strands
app.get('/api/strands', async (req, res) => {
    try {
        const strands = await Strand.aggregate([
            {
                $lookup: {
                    from: 'researchpapers',
                    localField: '_id',
                    foreignField: 'strand_id',
                    as: 'papers'
                }
            },
            {
                $addFields: {
                    paperCount: { $size: '$papers' },
                    totalDownloads: { $sum: '$papers.download_count' },
                    id: '$_id' // Maintain compatibility if frontend uses .id
                }
            },
            {
                $project: {
                    papers: 0 // Remove the heavy papers array, keep everything else
                }
            },
            { $sort: { short: 1 } }
        ]);
        res.json(strands);
    } catch (error) {
        console.error('Error fetching strands:', error);
        res.status(500).json({ message: 'Error fetching strands' });
    }
});

// POST /api/strands - Create a new strand
app.post('/api/strands', isAuthenticated, async (req, res) => {
    try {
        const { short, name, description, icon } = req.body;

        const existingStrand = await Strand.findOne({ short: short.toUpperCase() });
        if (existingStrand) {
            return res.status(400).json({ message: 'Strand with this acronym already exists' });
        }

        const newStrand = new Strand({
            short,
            name,
            description,
            icon: icon || 'BookOpen'
        });

        await newStrand.save();
        res.status(201).json(newStrand);
    } catch (error) {
        console.error('Error creating strand:', error);
        res.status(500).json({ message: 'Error creating strand' });
    }
});

// PUT /api/strands/:id - Update a strand
app.put('/api/strands/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { short, name, description, icon } = req.body;

        const existingStrand = await Strand.findOne({ short: short.toUpperCase(), _id: { $ne: id } });
        if (existingStrand) {
            return res.status(400).json({ message: 'Strand with this acronym already exists' });
        }

        const updatedStrand = await Strand.findByIdAndUpdate(
            id,
            { short, name, description, icon },
            { new: true }
        );

        if (!updatedStrand) {
            return res.status(404).json({ message: 'Strand not found' });
        }

        res.json(updatedStrand);
    } catch (error) {
        console.error('Error updating strand:', error);
        res.status(500).json({ message: 'Error updating strand' });
    }
});

// DELETE /api/strands/:id - Delete a strand
app.delete('/api/strands/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

        const strand = await Strand.findById(id);
        if (!strand) {
            return res.status(404).json({ message: 'Strand not found' });
        }

        await Strand.findByIdAndDelete(id);
        res.json({ message: 'Strand deleted successfully' });
    } catch (error) {
        console.error('Error deleting strand:', error);
        res.status(500).json({ message: 'Error deleting strand' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// --- Research Paper Management Routes ---
const ResearchPaper = require('./models/ResearchPaper');
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

// GET /api/stats - Public stats for Hero Section (no auth required)
app.get('/api/stats', async (req, res) => {
    try {
        const totalPapers = await ResearchPaper.countDocuments();
        const activeStrands = await Strand.countDocuments();

        // Sum total downloads from all papers
        const downloadsResult = await ResearchPaper.aggregate([
            { $group: { _id: null, total: { $sum: "$download_count" } } }
        ]);
        const totalDownloads = downloadsResult.length > 0 ? downloadsResult[0].total : 0;

        res.json({
            papers: totalPapers,
            downloads: totalDownloads,
            strands: activeStrands,
            since: 2020 // Static value - when the library started
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// GET /api/papers - Get all papers
app.get('/api/papers', async (req, res) => {
    try {
        const papers = await ResearchPaper.find()
            .populate('strand_id', 'short name')
            .sort({ createdAt: -1 });

        // Transform data
        const formattedPapers = papers.map(paper => ({
            _id: paper._id,
            id: paper._id,
            title: paper.title,
            authors: paper.authors,
            author_display: paper.authors.map(a => `${a.lastName}, ${a.firstName.charAt(0)}.`).join(' & '),
            abstract: paper.abstract,
            keywords: paper.keywords,
            adviser: paper.adviser,
            school_year: paper.school_year,
            grade_section: paper.grade_section,
            strand: paper.strand_id?.short || 'N/A',
            strand_id: paper.strand_id,
            is_featured: paper.is_featured,
            download_count: paper.download_count,
            pdf_path: paper.pdf_path,
            createdAt: paper.createdAt,
            published_date: paper.createdAt // Ensure date availability
        }));

        res.json(formattedPapers);
    } catch (error) {
        console.error('Error fetching papers:', error);
        res.status(500).json({ message: 'Error fetching papers' });
    }
});

// GET /api/papers/view/:id - View PDF (Stream) - MUST be before /:id
app.get('/api/papers/view/:id', async (req, res) => {
    try {
        const paper = await ResearchPaper.findById(req.params.id);
        if (!paper || !paper.pdf_path) return res.status(404).json({ message: 'File not found' });

        const filePath = path.join(paperStoragePath, paper.pdf_path);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing on server' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${paper.title}.pdf"`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error serving PDF:', error);
        res.status(500).send('Server Error');
    }
});

// GET /api/papers/download/:id - Download PDF and increment counter - MUST be before /:id
app.get('/api/papers/download/:id', async (req, res) => {
    try {
        const paper = await ResearchPaper.findByIdAndUpdate(
            req.params.id,
            { $inc: { download_count: 1 } },
            { new: true }
        );

        if (!paper || !paper.pdf_path) return res.status(404).json({ message: 'File not found' });

        const filePath = path.join(paperStoragePath, paper.pdf_path);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing on server' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${paper.title}.pdf"`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error downloading PDF:', error);
        res.status(500).send('Server Error');
    }
});

// GET /api/papers/:id - Get single paper details
app.get('/api/papers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const paper = await ResearchPaper.findById(id).populate('strand_id', 'short name');

        if (!paper) {
            return res.status(404).json({ message: 'Paper not found' });
        }

        const formattedPaper = {
            _id: paper._id,
            id: paper._id,
            title: paper.title,
            authors: paper.authors,
            author_display: paper.authors.map(a => `${a.lastName}, ${a.firstName.charAt(0)}.`).join(' & '),
            abstract: paper.abstract,
            keywords: paper.keywords,
            adviser: paper.adviser,
            school_year: paper.school_year,
            grade_section: paper.grade_section,
            strand: paper.strand_id?.short || 'N/A',
            strand_id: paper.strand_id,
            is_featured: paper.is_featured,
            download_count: paper.download_count,
            pdf_path: paper.pdf_path,
            createdAt: paper.createdAt,
            published_date: paper.createdAt
        };

        res.json(formattedPaper);
    } catch (error) {
        console.error('Error fetching paper details:', error);
        res.status(500).json({ message: 'Error fetching paper details' });
    }
});

// POST /api/papers - Create new paper with PDF
app.post('/api/papers', isAuthenticated, upload.single('pdf'), async (req, res) => {
    try {
        // Parse basic text fields
        const { title, abstract, keywords, adviser, school_year, grade_section, strand, is_featured } = req.body;

        // Parse authors (sent as JSON string from frontend)
        let authors = [];
        try {
            authors = JSON.parse(req.body.authors);
        } catch (e) {
            console.error('Error parsing authors:', e);
            return res.status(400).json({ message: 'Invalid authors format' });
        }

        // Find Strand ID
        const strandObj = await Strand.findOne({ short: strand });
        if (!strandObj) {
            // Should not happen if frontend validates, but just in case
            if (req.file) fs.unlinkSync(req.file.path); // Delete uploaded file
            return res.status(400).json({ message: 'Invalid Strand' });
        }

        const newPaper = new ResearchPaper({
            title,
            authors,
            abstract,
            keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
            adviser,
            school_year,
            grade_section,
            strand_id: strandObj._id,
            is_featured: is_featured === 'true', // FormData sends booleans as strings
            pdf_path: req.file ? req.file.filename : ''
        });

        await newPaper.save();
        res.status(201).json({ message: 'Paper added successfully', paper: newPaper });

    } catch (error) {
        console.error('Error adding paper:', error);
        if (req.file) fs.unlinkSync(req.file.path); // Cleanup on error
        res.status(500).json({ message: 'Error adding paper' });
    }
});

// PUT /api/papers/:id - Update paper (optional PDF update)
app.put('/api/papers/:id', isAuthenticated, upload.single('pdf'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, abstract, keywords, adviser, school_year, grade_section, strand, is_featured } = req.body;

        const paper = await ResearchPaper.findById(id);
        if (!paper) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Paper not found' });
        }

        // Update fields if provided
        if (title) paper.title = title;
        if (abstract) paper.abstract = abstract;
        if (keywords) paper.keywords = keywords.split(',').map(k => k.trim());
        if (adviser) paper.adviser = adviser;
        if (school_year) paper.school_year = school_year;
        if (grade_section) paper.grade_section = grade_section;
        if (is_featured !== undefined) paper.is_featured = is_featured === 'true';

        if (strand) {
            const strandObj = await Strand.findOne({ short: strand });
            if (strandObj) paper.strand_id = strandObj._id;
        }

        if (req.body.authors) {
            try {
                paper.authors = JSON.parse(req.body.authors);
            } catch (e) {
                console.error('Error parsing authors update:', e);
            }
        }

        // Handle File Update
        if (req.file) {
            // Delete old file
            const oldPath = path.join(paperStoragePath, paper.pdf_path);
            if (fs.existsSync(oldPath)) {
                try {
                    fs.unlinkSync(oldPath);
                } catch (err) {
                    console.error("Failed to delete old file:", err);
                }
            }
            paper.pdf_path = req.file.filename;
        }
        // If title changed but NO new file, rename the existing file to match new title?
        // This is complex because we might overwrite another file. 
        // For safety, let's strictly rename ONLY if specific logic is requested, otherwise keep old filename or just rely on new uploads.
        // User request: "rename the pdf using its title entered".
        // If we rename logic here, we must check if file exists.
        else if (title && title !== paper.title) {
            const oldPath = path.join(paperStoragePath, paper.pdf_path);
            if (fs.existsSync(oldPath)) {
                const sanitizedTitle = title.replace(/[^a-zA-Z0-9 ]/g, "").trim();
                const newFilename = `${sanitizedTitle}.pdf`;
                const newPath = path.join(paperStoragePath, newFilename);

                if (!fs.existsSync(newPath)) { // Only rename if target doesn't exist to avoid collision
                    fs.renameSync(oldPath, newPath);
                    paper.pdf_path = newFilename;
                }
            }
        }

        await paper.save();
        res.json({ message: 'Paper updated successfully', paper });

    } catch (error) {
        console.error('Error updating paper:', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error updating paper' });
    }
});

// DELETE /api/papers/:id - Delete paper and file
app.delete('/api/papers/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const paper = await ResearchPaper.findById(id);

        if (!paper) return res.status(404).json({ message: 'Paper not found' });

        // Delete file
        if (paper.pdf_path) {
            const filePath = path.join(paperStoragePath, paper.pdf_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await ResearchPaper.findByIdAndDelete(id);
        res.json({ message: 'Paper deleted successfully' });
    } catch (error) {
        console.error('Error deleting paper:', error);
        res.status(500).json({ message: 'Error deleting paper' });
    }
});

// --- Dashboard Routes ---

// GET /api/dashboard/stats - Get aggregated dashboard stats
app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
        // 1. Basic Counts
        const totalPapers = await ResearchPaper.countDocuments();
        const activeStrands = await Strand.countDocuments();
        const registeredUsers = await User.countDocuments();

        // 2. Total Downloads
        const downloadsResult = await ResearchPaper.aggregate([
            { $group: { _id: null, total: { $sum: "$download_count" } } }
        ]);
        const totalDownloads = downloadsResult.length > 0 ? downloadsResult[0].total : 0;

        // 3. Recent Uploads (Limit 5)
        const recentUploadsResponse = await ResearchPaper.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('strand_id', 'short');

        const recentUploads = recentUploadsResponse.map(p => ({
            id: p._id,
            title: p.title,
            strand: p.strand_id?.short || 'N/A',
            download_count: p.download_count,
            published_date: p.createdAt
        }));

        // 4. Papers by School Year
        const schoolYearData = await ResearchPaper.aggregate([
            {
                $group: {
                    _id: "$school_year",
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const schoolYearDistribution = schoolYearData.map(item => ({
            year: item._id || 'Unknown',
            count: item.count
        }));

        // 5. Downloads by Strand
        // We need to look up strand names. Strand ID is in ResearchPaper.
        const downloadsByStrandRaw = await ResearchPaper.aggregate([
            {
                $group: {
                    _id: "$strand_id",
                    downloads: { $sum: "$download_count" }
                }
            },
            {
                $lookup: {
                    from: "strands",
                    localField: "_id",
                    foreignField: "_id",
                    as: "strand_info"
                }
            },
            { $unwind: "$strand_info" },
            {
                $project: {
                    strand: "$strand_info.short",
                    downloads: 1
                }
            }
        ]);

        // Format for frontend
        const downloadsByStrand = downloadsByStrandRaw.map(item => ({
            strand: item.strand,
            downloads: item.downloads
        })).sort((a, b) => b.downloads - a.downloads); // Sort by downloads desc

        res.json({
            stats: {
                totalPapers,
                totalDownloads,
                activeStrands,
                registeredUsers,
                // Placeholder trends for small changes (optional, or calculate properly)
                papersTrend: 0,
                downloadsTrend: 0
            },
            recentUploads,
            schoolYearDistribution,
            downloadsByStrand
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});
// Serve static files from the React app (if build exists)
const frontendPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    // Catch-all route to serve index.html for SPA routing
    // This allows browser refreshes on sub-pages to work
    app.use((req, res, next) => {
        // Skip API routes
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}
