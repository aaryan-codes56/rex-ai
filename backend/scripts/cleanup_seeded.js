const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Course = require('../src/models/Course');

async function cleanupSeeded() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected.');

        // Delete courses by specific seeded instructor names
        const result = await Course.deleteMany({
            instructorName: { $in: ['Dr. Alan Turing', 'Andrew Ng', 'Yann LeCun', 'RexAI Expert'] }
        });

        console.log(`Deleted ${result.deletedCount} seeded courses.`);

    } catch (error) {
        console.error('Cleanup error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

cleanupSeeded();
