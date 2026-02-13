const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8080'],
    credentials: true
}));
app.use(express.json());

// Session Config
if (!process.env.SESSION_SECRET) {
    console.error('FATAL ERROR: SESSION_SECRET is not defined in .env');
    process.exit(1);
}

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        touchAfter: 24 * 3600 // Only update session in DB once per day
    }),
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 15 // 15 minutes
    }
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/strands', require('./routes/strandRoutes'));
app.use('/api/papers', require('./routes/paperRoutes'));
app.use('/api/stats', require('./routes/statsRoutes')); // Public stats (/api/stats)
app.use('/api/dashboard', require('./routes/statsRoutes')); // Dashboard stats (/api/dashboard/stats)
app.use('/api/activity-logs', require('./routes/activityLogRoutes')); // Activity logs (/api/activity-logs)

// Serve static files from the React app (if build exists)
const frontendPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    app.use((req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
