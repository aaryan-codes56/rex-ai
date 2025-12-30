const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Course = require('../src/models/Course');

async function seedDataScience() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected.');

        const category = 'Data Science';
        const count = await Course.countDocuments({ category: category });
        console.log(`Found ${count} existing courses for ${category}`);

        if (count >= 3) {
            console.log('Skipping seeding, enough courses exist.');
            process.exit(0);
        }

        console.log(`Seeding courses for ${category}...`);

        const courses = [
            {
                title: 'Data Science Fundamentals',
                description: 'Introduction to data science, python, and statistics.',
                category: category,
                level: 'Beginner',
                price: 0,
                instructor: new mongoose.Types.ObjectId(),
                instructorName: 'Dr. Alan Turing',
                rating: 4.8,
                totalRatings: 150,
                isPublished: true,
                lectures: [],
                createdAt: new Date()
            },
            {
                title: 'Machine Learning Mastery',
                description: 'Deep dive into ML algorithms and practical applications.',
                category: category,
                level: 'Intermediate',
                price: 2999,
                instructor: new mongoose.Types.ObjectId(),
                instructorName: 'Andrew Ng',
                rating: 4.9,
                totalRatings: 300,
                isPublished: true,
                lectures: [],
                createdAt: new Date()
            },
            {
                title: 'Deep Learning with PyTorch',
                description: 'Build and train neural networks using PyTorch.',
                category: category,
                level: 'Advanced',
                price: 3999,
                instructor: new mongoose.Types.ObjectId(),
                instructorName: 'Yann LeCun',
                rating: 4.7,
                totalRatings: 200,
                isPublished: true,
                lectures: [],
                createdAt: new Date()
            }
        ];

        await Course.insertMany(courses);
        console.log('Data Science courses seeded successfully!');

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

seedDataScience();
