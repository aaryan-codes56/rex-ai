const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const generateAIInsights = async (industry) => {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes, text, or markdown:

    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
      "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
    }

    Rules:
    - Include at least 5 roles in salaryRanges.
    - Growth rate must be a percentage (number only, no % symbol).
    - Include minimum 5 skills, 5 trends, and 5 recommended skills.
    - Return ONLY valid JSON. No explanations. No markdown. No code fences.
  `;

  const result = await model.generateContent(prompt);
  const json = result.response.text().trim();
  return JSON.parse(json);
};

// Get industry insights with AI generation
router.get('/:industry', authMiddleware, async (req, res) => {
  try {
    const { industry } = req.params;
    
    // Try to generate AI insights first
    try {
      const aiInsights = await generateAIInsights(industry);
      res.json(aiInsights);
      return;
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      // Fall back to static data
    }
    
    // Fallback static data
    const fallbackData = {
      Technology: {
        salaryRanges: [
          { role: "Software Engineer", min: 70000, max: 150000, median: 95000, location: "US" },
          { role: "Data Scientist", min: 80000, max: 160000, median: 110000, location: "US" },
          { role: "Product Manager", min: 90000, max: 180000, median: 125000, location: "US" },
          { role: "DevOps Engineer", min: 75000, max: 155000, median: 105000, location: "US" },
          { role: "Frontend Developer", min: 65000, max: 140000, median: 90000, location: "US" }
        ],
        growthRate: 22,
        demandLevel: "High",
        topSkills: ["JavaScript", "Python", "React", "AWS", "Docker"],
        marketOutlook: "Positive",
        keyTrends: ["AI Integration", "Cloud Migration", "Remote Work", "Cybersecurity Focus", "Low-Code Platforms"],
        recommendedSkills: ["Machine Learning", "Kubernetes", "TypeScript", "GraphQL", "Microservices"]
      }
    };

    const data = fallbackData[industry] || fallbackData.Technology;
    res.json(data);
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;