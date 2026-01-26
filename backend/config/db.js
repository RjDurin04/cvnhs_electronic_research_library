const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('FATAL ERROR: MONGO_URI is not defined in .env');
            process.exit(1);
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Seed Admin User
        const adminExists = await User.findOne({ role: 'admin' });
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
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
