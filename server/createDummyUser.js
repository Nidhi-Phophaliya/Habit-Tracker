import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

async function createUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habittracker');

        // Delete all users with the same email
        const deleteResult = await User.deleteMany({ email: 'testuser@example.com' });
        console.log(`Deleted ${deleteResult.deletedCount} existing user(s) with email testuser@example.com`);

        const hashedPassword = await bcrypt.hash('password123', 10);

        const user = new User({
            name: 'Test User',
            email: 'testuser@example.com',
            password: hashedPassword,
            profilePicture: '',
            preferences: {
                theme: 'system',
                reminderTime: '20:00',
                weekStart: 'monday'
            },
            timezone: 'UTC'
        });

        await user.save();
        console.log('Dummy user created!');
    } catch (error) {
        console.error('Error creating dummy user:', error);
    } finally {
        mongoose.disconnect();
    }
}

createUser();
