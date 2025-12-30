const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const generateAIInsights = async (industry) => {
  const prompt = `
    You are analyzing the ${industry} industry specifically for the INDIAN market. Provide insights ONLY for ${industry} industry roles and skills.
    
    Analyze the current state of the ${industry} industry in India in 2024 and provide comprehensive insights in ONLY the following JSON format without any additional notes, text, or markdown:

    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "India" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
      "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
    }

    CRITICAL Requirements:
    - Context: INDIA Market Only
    - Currency: Indian Rupees (INR) per annum
    - Include exactly 5 job roles that are SPECIFICALLY from the ${industry} industry ONLY
    - If industry is Sales: include roles like Sales Representative, Account Manager, Sales Manager, Business Development Representative, Sales Director
    - If industry is Marketing: include roles like Marketing Specialist, Digital Marketing Manager, Content Marketing Manager, SEO Specialist, Social Media Manager
    - If industry is Finance: include roles like Financial Analyst, Investment Banker, Portfolio Manager, Risk Manager, Quantitative Analyst
    - Growth rate should be annual percentage (number only, no % symbol)
    - All data should be current and realistic for the ${industry} industry in INDIA
    - Salaries should be realistic annual packages in INR (e.g. 500000 for 5 LPA)
    - Return ONLY valid JSON with no additional text, explanations, or formatting
  `;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();

  // Clean the response more thoroughly
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();
  text = text.replace(/^[^{]*{/, '{').replace(/}[^}]*$/, '}');

  return JSON.parse(text);
};

// Get industry insights with AI generation
router.get('/:industry', authMiddleware, async (req, res) => {
  try {
    let { industry } = req.params;

    // Normalize industry name
    industry = industry.charAt(0).toUpperCase() + industry.slice(1).toLowerCase();
    console.log('Generating insights for industry:', industry);

    // Try to generate AI insights first
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      console.log('Using Gemini AI to generate insights for:', industry);
      const aiInsights = await generateAIInsights(industry);
      console.log('AI insights generated successfully');

      // Validate the response structure
      if (aiInsights.salaryRanges && aiInsights.topSkills && aiInsights.keyTrends) {
        res.json(aiInsights);
        return;
      } else {
        throw new Error('Invalid AI response structure');
      }
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      console.log('Falling back to static data for:', industry);
      // Fall back to static data
    }

    // Fallback static data
    const fallbackData = {
      Technology: {
        salaryRanges: [
          { role: "Software Engineer", min: 500000, max: 1500000, median: 800000, location: "India" },
          { role: "Data Scientist", min: 800000, max: 2000000, median: 1200000, location: "India" },
          { role: "Product Manager", min: 1200000, max: 3000000, median: 1800000, location: "India" },
          { role: "DevOps Engineer", min: 600000, max: 1800000, median: 1000000, location: "India" },
          { role: "Frontend Developer", min: 400000, max: 1200000, median: 700000, location: "India" }
        ],
        growthRate: 15,
        demandLevel: "High",
        topSkills: ["JavaScript", "Python", "React", "AWS", "Docker"],
        marketOutlook: "Positive",
        keyTrends: ["AI Integration", "Cloud Migration", "Remote Work", "Cybersecurity Focus", "Low-Code Platforms"],
        recommendedSkills: ["Machine Learning", "Kubernetes", "TypeScript", "GraphQL", "Microservices"]
      },
      Sales: {
        salaryRanges: [
          { role: "Sales Representative", min: 300000, max: 600000, median: 400000, location: "India" },
          { role: "Account Manager", min: 500000, max: 1000000, median: 700000, location: "India" },
          { role: "Sales Manager", min: 800000, max: 1800000, median: 1200000, location: "India" },
          { role: "Business Development Representative", min: 350000, max: 700000, median: 450000, location: "India" },
          { role: "Sales Director", min: 2000000, max: 4000000, median: 2800000, location: "India" }
        ],
        growthRate: 10,
        demandLevel: "High",
        topSkills: ["CRM Software", "Lead Generation", "Negotiation", "Communication", "Pipeline Management"],
        marketOutlook: "Positive",
        keyTrends: ["Social Selling", "Sales Automation", "AI-Powered CRM", "Video Prospecting", "Account-Based Selling"],
        recommendedSkills: ["Salesforce", "HubSpot", "LinkedIn Sales Navigator", "Sales Analytics", "Customer Success"]
      },
      Finance: {
        salaryRanges: [
          { role: "Financial Analyst", min: 450000, max: 900000, median: 650000, location: "India" },
          { role: "Investment Banker", min: 1200000, max: 3500000, median: 1800000, location: "India" },
          { role: "Portfolio Manager", min: 1500000, max: 4000000, median: 2500000, location: "India" },
          { role: "Risk Manager", min: 1000000, max: 2500000, median: 1600000, location: "India" },
          { role: "Quantitative Analyst", min: 1200000, max: 3000000, median: 1800000, location: "India" }
        ],
        growthRate: 8,
        demandLevel: "Medium",
        topSkills: ["Financial Modeling", "Excel", "Python", "SQL", "Risk Analysis"],
        marketOutlook: "Positive",
        keyTrends: ["Digital Banking", "Cryptocurrency", "ESG Investing", "RegTech", "Robo-Advisors"],
        recommendedSkills: ["Blockchain", "Machine Learning", "Tableau", "R Programming", "Financial Planning"]
      },
      Healthcare: {
        salaryRanges: [
          { role: "Registered Nurse", min: 250000, max: 500000, median: 350000, location: "India" },
          { role: "Healthcare Administrator", min: 500000, max: 1000000, median: 700000, location: "India" },
          { role: "Medical Technologist", min: 300000, max: 600000, median: 400000, location: "India" },
          { role: "Healthcare Data Analyst", min: 400000, max: 900000, median: 600000, location: "India" },
          { role: "Clinical Research Coordinator", min: 350000, max: 700000, median: 450000, location: "India" }
        ],
        growthRate: 12,
        demandLevel: "High",
        topSkills: ["Patient Care", "Medical Records", "HIPAA Compliance", "Clinical Research", "Healthcare IT"],
        marketOutlook: "Positive",
        keyTrends: ["Telemedicine", "AI Diagnostics", "Personalized Medicine", "Digital Health Records", "Preventive Care"],
        recommendedSkills: ["Electronic Health Records", "Data Analysis", "Telehealth Platforms", "Medical Coding", "Quality Assurance"]
      },
      Marketing: {
        salaryRanges: [
          { role: "Digital Marketing Specialist", min: 300000, max: 600000, median: 400000, location: "India" },
          { role: "Marketing Manager", min: 600000, max: 1500000, median: 900000, location: "India" },
          { role: "Content Marketing Manager", min: 450000, max: 1000000, median: 650000, location: "India" },
          { role: "SEO Specialist", min: 250000, max: 500000, median: 350000, location: "India" },
          { role: "Social Media Manager", min: 300000, max: 600000, median: 400000, location: "India" }
        ],
        growthRate: 10,
        demandLevel: "High",
        topSkills: ["Digital Marketing", "SEO", "Social Media", "Content Creation", "Analytics"],
        marketOutlook: "Positive",
        keyTrends: ["Influencer Marketing", "Video Content", "AI-Powered Ads", "Privacy-First Marketing", "Omnichannel Strategies"],
        recommendedSkills: ["Marketing Automation", "Google Analytics", "Facebook Ads", "Email Marketing", "Conversion Optimization"]
      },
      Education: {
        salaryRanges: [
          { role: "Elementary Teacher", min: 200000, max: 500000, median: 300000, location: "India" },
          { role: "Instructional Designer", min: 400000, max: 900000, median: 600000, location: "India" },
          { role: "Education Administrator", min: 500000, max: 1200000, median: 800000, location: "India" },
          { role: "Curriculum Developer", min: 400000, max: 800000, median: 550000, location: "India" },
          { role: "Educational Technology Specialist", min: 450000, max: 950000, median: 650000, location: "India" }
        ],
        growthRate: 5,
        demandLevel: "Medium",
        topSkills: ["Curriculum Development", "Classroom Management", "Educational Technology", "Assessment", "Student Engagement"],
        marketOutlook: "Neutral",
        keyTrends: ["Online Learning", "Personalized Education", "EdTech Integration", "Competency-Based Learning", "Hybrid Classrooms"],
        recommendedSkills: ["Learning Management Systems", "Educational Apps", "Data-Driven Instruction", "Virtual Reality in Education", "Student Analytics"]
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