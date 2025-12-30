const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGen() {
    console.log('--- STARTING TEST ---');
    console.log('API KEY Length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 'MISSING');

    const category = 'Finance';

    try {
        console.log(`Attempting Gemini Generation for ${category}...`);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Try the model that failed before
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Generate 1 sample course for ${category} in JSON.`;
        console.log('Sending prompt...');

        const result = await model.generateContent(prompt);
        console.log('Gemini Response Received.');
        console.log(result.response.text());

    } catch (error) {
        console.error('!!! Gemini Failed !!!');
        console.error(error.message);

        console.log('\n--- TESTING FALLBACK LOGIC & DB INSERTION ---');
        console.log(`Generating fallback courses for ${category}...`);

        // Connect to DB
        await mongoose.connect(process.env.DATABASE_URL);
        const Course = require('../src/models/Course');

        const fallbackCourses = [
            {
                title: `${category} Fundamentals`,
                description: `A comprehensive introduction to ${category}.`,
                category: category,
                level: 'Beginner',
                price: 0,
                instructor: new mongoose.Types.ObjectId(), // Dangling ID
                instructorName: 'RexAI Expert',
                rating: 4.5,
                totalRatings: 125,
                isPublished: true,
                lectures: [],
                createdAt: new Date()
            }
        ];

        try {
            const docs = await Course.insertMany(fallbackCourses);
            console.log(`✅ Successfully inserted ${docs.length} fallback courses into DB.`);
            console.log('Sample Doc ID:', docs[0]._id);

            // Cleanup
            await Course.deleteMany({ instructorName: 'RexAI Expert' });
            console.log('Cleaned up test data.');

        } catch (dbError) {
            console.error('❌ DB Insertion Failed:', dbError);
        }

        await mongoose.disconnect();
    }

    console.log('--- TEST FINISHED ---');
    process.exit(0);
}

testGen();
