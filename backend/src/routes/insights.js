const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const generateAIInsights = async (industry) => {
  const prompt = `
    You are analyzing the ${industry} industry specifically. Provide insights ONLY for ${industry} industry roles and skills. Do NOT include roles from other industries like Technology or Software Development unless the user's industry is specifically Technology.
    
    Analyze the current state of the ${industry} industry in 2024 and provide comprehensive insights in ONLY the following JSON format without any additional notes, text, or markdown:

    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "US" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
      "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
    }

    CRITICAL Requirements:
    - Include exactly 5 job roles that are SPECIFICALLY from the ${industry} industry ONLY
    - If industry is Sales: include roles like Sales Representative, Account Manager, Sales Manager, Business Development Representative, Sales Director
    - If industry is Marketing: include roles like Marketing Specialist, Digital Marketing Manager, Content Marketing Manager, SEO Specialist, Social Media Manager
    - If industry is Finance: include roles like Financial Analyst, Investment Banker, Portfolio Manager, Risk Manager, Quantitative Analyst
    - DO NOT mix industries - stick strictly to the ${industry} industry
    - Growth rate should be annual percentage (number only, no % symbol)
    - topSkills should be the most in-demand skills for ${industry} professionals specifically
    - keyTrends should be current ${industry} industry developments and future directions
    - recommendedSkills should be emerging skills ${industry} professionals should learn
    - All data should be current and realistic for the ${industry} industry ONLY
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
      },
      Sales: {
        salaryRanges: [
          { role: "Sales Representative", min: 40000, max: 80000, median: 55000, location: "US" },
          { role: "Account Manager", min: 50000, max: 100000, median: 70000, location: "US" },
          { role: "Sales Manager", min: 70000, max: 140000, median: 95000, location: "US" },
          { role: "Business Development Representative", min: 35000, max: 70000, median: 50000, location: "US" },
          { role: "Sales Director", min: 90000, max: 200000, median: 130000, location: "US" }
        ],
        growthRate: 12,
        demandLevel: "High",
        topSkills: ["CRM Software", "Lead Generation", "Negotiation", "Communication", "Pipeline Management"],
        marketOutlook: "Positive",
        keyTrends: ["Social Selling", "Sales Automation", "AI-Powered CRM", "Video Prospecting", "Account-Based Selling"],
        recommendedSkills: ["Salesforce", "HubSpot", "LinkedIn Sales Navigator", "Sales Analytics", "Customer Success"]
      },
      Finance: {
        salaryRanges: [
          { role: "Financial Analyst", min: 55000, max: 120000, median: 75000, location: "US" },
          { role: "Investment Banker", min: 85000, max: 200000, median: 130000, location: "US" },
          { role: "Portfolio Manager", min: 90000, max: 250000, median: 150000, location: "US" },
          { role: "Risk Manager", min: 70000, max: 160000, median: 105000, location: "US" },
          { role: "Quantitative Analyst", min: 80000, max: 180000, median: 120000, location: "US" }
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
          { role: "Registered Nurse", min: 60000, max: 95000, median: 75000, location: "US" },
          { role: "Healthcare Administrator", min: 70000, max: 140000, median: 95000, location: "US" },
          { role: "Medical Technologist", min: 50000, max: 85000, median: 65000, location: "US" },
          { role: "Healthcare Data Analyst", min: 55000, max: 100000, median: 75000, location: "US" },
          { role: "Clinical Research Coordinator", min: 45000, max: 80000, median: 60000, location: "US" }
        ],
        growthRate: 15,
        demandLevel: "High",
        topSkills: ["Patient Care", "Medical Records", "HIPAA Compliance", "Clinical Research", "Healthcare IT"],
        marketOutlook: "Positive",
        keyTrends: ["Telemedicine", "AI Diagnostics", "Personalized Medicine", "Digital Health Records", "Preventive Care"],
        recommendedSkills: ["Electronic Health Records", "Data Analysis", "Telehealth Platforms", "Medical Coding", "Quality Assurance"]
      },
      Marketing: {
        salaryRanges: [
          { role: "Digital Marketing Specialist", min: 45000, max: 85000, median: 60000, location: "US" },
          { role: "Marketing Manager", min: 65000, max: 130000, median: 85000, location: "US" },
          { role: "Content Marketing Manager", min: 50000, max: 95000, median: 70000, location: "US" },
          { role: "SEO Specialist", min: 40000, max: 80000, median: 55000, location: "US" },
          { role: "Social Media Manager", min: 35000, max: 75000, median: 50000, location: "US" }
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
          { role: "Elementary Teacher", min: 40000, max: 70000, median: 50000, location: "US" },
          { role: "Instructional Designer", min: 50000, max: 90000, median: 65000, location: "US" },
          { role: "Education Administrator", min: 60000, max: 120000, median: 80000, location: "US" },
          { role: "Curriculum Developer", min: 45000, max: 85000, median: 60000, location: "US" },
          { role: "Educational Technology Specialist", min: 50000, max: 95000, median: 70000, location: "US" }
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