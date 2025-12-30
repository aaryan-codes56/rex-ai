const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Course = require('../src/models/Course');

const resetDb = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            console.error('Error: DATABASE_URL not found in environment');
            process.exit(1);
        }

        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected.');

        console.log('Listing collections...');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Found collections:', collections.map(c => c.name));

        for (const collection of collections) {
            console.log(`Dropping collection: ${collection.name}...`);
            await mongoose.connection.db.dropCollection(collection.name);
            console.log(`Dropped ${collection.name}.`);
        }

        console.log('✅ Database reset complete. All data cleared.');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Reset failed:', error);
        process.exit(1);
    }
};

resetDb();
