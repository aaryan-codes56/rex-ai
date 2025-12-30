const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch if node 18+

async function testFetch() {
    const category = 'Data Science';
    const url = `http://localhost:3001/api/courses?category=${encodeURIComponent(category)}&limit=3`;

    console.log(`Fetching from: ${url}`);
    const start = Date.now();

    try {
        const response = await fetch(url);
        const data = await response.json();
        const duration = (Date.now() - start) / 1000;

        console.log(`Status: ${response.status}`);
        console.log(`Duration: ${duration}s`);
        console.log('Courses found:', data.courses ? data.courses.length : 0);

        if (data.courses && data.courses.length > 0) {
            console.log('First Course:', data.courses[0].title);
        } else {
            console.log('Response:', data);
        }

    } catch (error) {
        console.error('Fetch failed:', error.message);
    }
}

testFetch();
