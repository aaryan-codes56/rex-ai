const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Generate interview questions using Gemini AI
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const skillsText = user.skills ? ` with expertise in ${user.skills}` : '';
    const industry = user.industry || 'Technology';
    const prompt = `
      You are generating interview questions for the ${industry} industry specifically. Do NOT include questions from other industries.
      
      Generate exactly 10 technical interview questions for a ${industry} professional${skillsText}.
      
      CRITICAL: Focus ONLY on ${industry}-specific knowledge, tools, concepts, and practices.
      - If industry is Sales: focus on CRM, sales processes, lead generation, negotiation, etc.
      - If industry is Marketing: focus on digital marketing, SEO, campaigns, analytics, etc.
      - If industry is Finance: focus on financial analysis, investments, accounting, etc.
      - If industry is Healthcare: focus on medical procedures, regulations, patient care, etc.
      - If industry is Technology: focus on programming, software development, systems, etc.
      
      Each question must be multiple choice with exactly 4 options.
      Make questions relevant to current ${industry} practices and technologies in 2024.
      
      Return ONLY valid JSON in this exact format with no additional text, markdown, or code blocks:
      {
        "questions": [
          {
            "question": "string",
            "options": ["string", "string", "string", "string"],
            "correctAnswer": "string",
            "explanation": "string"
          }
        ]
      }
    `;

    try {
      if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY not found in environment variables');
        throw new Error('GEMINI_API_KEY not configured');
      }
      
      console.log('=== GEMINI API CALL START ===');
      console.log('API Key available:', !!process.env.GEMINI_API_KEY);
      console.log('API Key length:', process.env.GEMINI_API_KEY?.length);
      console.log('Generating questions for industry:', industry);
      console.log('User skills:', user.skills);
      console.log('Full prompt:', prompt.substring(0, 300) + '...');
      
      console.log('Calling Gemini API...');
      const result = await model.generateContent(prompt);
      console.log('Gemini API call completed');
      const response = result.response;
      let text = response.text();
      console.log('=== GEMINI API CALL END ===');
      
      console.log('Raw AI Response length:', text.length);
      console.log('Raw AI Response preview:', text.substring(0, 200));
      
      // Clean the response more thoroughly
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      text = text.replace(/^[^{]*{/, '{').replace(/}[^}]*$/, '}');
      
      console.log('Cleaned AI Response preview:', text.substring(0, 200));
      
      let quiz;
      try {
        quiz = JSON.parse(text);
        console.log('Successfully parsed JSON, questions count:', quiz.questions?.length);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError.message);
        console.log('Failed text:', text.substring(0, 500));
        throw new Error('Failed to parse AI response as JSON');
      }

      if (quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0) {
        console.log('Sending', quiz.questions.length, 'AI-generated questions for', industry);
        console.log('Sample question:', quiz.questions[0]?.question);
        res.json({ questions: quiz.questions });
      } else {
        console.error('Invalid AI response format:', { hasQuestions: !!quiz.questions, isArray: Array.isArray(quiz.questions), length: quiz.questions?.length });
        throw new Error('Invalid response format - no valid questions array');
      }
    } catch (aiError) {
      console.error('AI generation error:', aiError.message);
      console.error('Full AI error:', aiError);
      console.log('Falling back to static questions for:', industry);
      const fallbackQuestions = getFallbackQuestions(industry);
      console.log('Sending', fallbackQuestions.length, 'fallback questions for', industry);
      res.json({ questions: fallbackQuestions });
    }
  } catch (error) {
    console.error('Generate interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save quiz results
router.post('/results', authMiddleware, async (req, res) => {
  try {
    const { questions, answers, score } = req.body;
    const user = await User.findById(req.user.id);
    
    const questionResults = questions.map((q, index) => ({
      question: q.question,
      answer: q.correctAnswer,
      userAnswer: answers[index],
      isCorrect: q.correctAnswer === answers[index],
      explanation: q.explanation,
    }));

    const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
    let improvementTip = null;

    if (wrongAnswers.length > 0) {
      const wrongQuestionsText = wrongAnswers
        .map((q) => `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`)
        .join('\n\n');

      const improvementPrompt = `
        The user got the following ${user.industry} technical interview questions wrong:

        ${wrongQuestionsText}

        Based on these mistakes, provide a concise, specific improvement tip.
        Focus on the knowledge gaps revealed by these wrong answers.
        Keep the response under 2 sentences and make it encouraging.
        Don't explicitly mention the mistakes, instead focus on what to learn/practice.
      `;

      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const tipResult = await model.generateContent(improvementPrompt);
        improvementTip = tipResult.response.text().trim();
      } catch (error) {
        console.error('Error generating improvement tip:', error);
      }
    }

    const result = {
      id: Date.now().toString(),
      userId: req.user.id,
      quizScore: score,
      questions: questionResults,
      category: 'Technical',
      improvementTip,
      createdAt: new Date()
    };

    res.json({ assessment: result });
  } catch (error) {
    console.error('Save results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

function getFallbackQuestions(industry) {
  const questionSets = {
    Technology: [
      {
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctAnswer: "O(log n)",
        explanation: "Binary search divides the search space in half with each iteration."
      },
      {
        question: "Which design pattern ensures a class has only one instance?",
        options: ["Factory", "Singleton", "Observer", "Strategy"],
        correctAnswer: "Singleton",
        explanation: "Singleton pattern restricts instantiation of a class to one object."
      },
      {
        question: "What does REST stand for?",
        options: ["Representational State Transfer", "Remote State Transfer", "Relational State Transfer", "Resource State Transfer"],
        correctAnswer: "Representational State Transfer",
        explanation: "REST is an architectural style for designing networked applications."
      },
      {
        question: "Which HTTP method is idempotent?",
        options: ["POST", "PUT", "PATCH", "DELETE"],
        correctAnswer: "PUT",
        explanation: "PUT requests can be called multiple times with the same result."
      },
      {
        question: "What is the purpose of a foreign key in a database?",
        options: ["Primary identification", "Data encryption", "Referential integrity", "Index optimization"],
        correctAnswer: "Referential integrity",
        explanation: "Foreign keys maintain referential integrity between related tables."
      },
      {
        question: "Which JavaScript method is used to add an element to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctAnswer: "push()",
        explanation: "The push() method adds one or more elements to the end of an array."
      },
      {
        question: "What is the difference between == and === in JavaScript?",
        options: ["No difference", "=== checks type and value", "== is faster", "=== is deprecated"],
        correctAnswer: "=== checks type and value",
        explanation: "=== performs strict equality comparison including type checking."
      },
      {
        question: "Which CSS property is used to create flexible layouts?",
        options: ["display: block", "display: flex", "display: inline", "display: table"],
        correctAnswer: "display: flex",
        explanation: "Flexbox provides a flexible way to arrange elements in a container."
      },
      {
        question: "What is the main purpose of version control systems like Git?",
        options: ["Code compilation", "Track changes and collaboration", "Database management", "User interface design"],
        correctAnswer: "Track changes and collaboration",
        explanation: "Version control systems track code changes and enable team collaboration."
      },
      {
        question: "Which principle suggests that software entities should be open for extension but closed for modification?",
        options: ["Single Responsibility", "Open/Closed", "Liskov Substitution", "Interface Segregation"],
        correctAnswer: "Open/Closed",
        explanation: "The Open/Closed Principle is one of the SOLID principles of object-oriented design."
      }
    ],
    Finance: [
      {
        question: "What is the Capital Asset Pricing Model (CAPM) used for?",
        options: ["Calculate interest rates", "Determine expected return", "Measure inflation", "Assess credit risk"],
        correctAnswer: "Determine expected return",
        explanation: "CAPM calculates the expected return of an asset based on its risk."
      },
      {
        question: "What does NPV stand for?",
        options: ["Net Present Value", "Net Profit Value", "New Product Value", "Net Portfolio Value"],
        correctAnswer: "Net Present Value",
        explanation: "NPV is the difference between present value of cash inflows and outflows."
      },
      {
        question: "What is the primary purpose of diversification in investment?",
        options: ["Maximize returns", "Reduce risk", "Increase liquidity", "Minimize taxes"],
        correctAnswer: "Reduce risk",
        explanation: "Diversification spreads risk across different investments to reduce overall portfolio risk."
      },
      {
        question: "What does ROI stand for?",
        options: ["Return on Investment", "Rate of Interest", "Risk of Investment", "Ratio of Income"],
        correctAnswer: "Return on Investment",
        explanation: "ROI measures the efficiency of an investment by comparing gain to cost."
      },
      {
        question: "Which financial statement shows a company's financial position at a specific point in time?",
        options: ["Income Statement", "Balance Sheet", "Cash Flow Statement", "Statement of Equity"],
        correctAnswer: "Balance Sheet",
        explanation: "The balance sheet provides a snapshot of assets, liabilities, and equity at a specific date."
      },
      {
        question: "What is the difference between stocks and bonds?",
        options: ["No difference", "Stocks are ownership, bonds are debt", "Bonds are riskier", "Stocks pay fixed interest"],
        correctAnswer: "Stocks are ownership, bonds are debt",
        explanation: "Stocks represent ownership in a company, while bonds are debt instruments."
      },
      {
        question: "What does P/E ratio measure?",
        options: ["Profit margin", "Price to Earnings", "Portfolio Efficiency", "Payment Equity"],
        correctAnswer: "Price to Earnings",
        explanation: "P/E ratio compares a company's stock price to its earnings per share."
      },
      {
        question: "What is compound interest?",
        options: ["Simple interest calculation", "Interest on principal and accumulated interest", "Government bond interest", "Corporate dividend"],
        correctAnswer: "Interest on principal and accumulated interest",
        explanation: "Compound interest is earned on both the principal and previously earned interest."
      },
      {
        question: "What is a bull market?",
        options: ["Declining market", "Rising market", "Volatile market", "Stable market"],
        correctAnswer: "Rising market",
        explanation: "A bull market is characterized by rising stock prices and investor optimism."
      },
      {
        question: "What does liquidity refer to in finance?",
        options: ["Profitability", "Ease of converting to cash", "Risk level", "Interest rate"],
        correctAnswer: "Ease of converting to cash",
        explanation: "Liquidity measures how quickly an asset can be converted to cash without affecting its price."
      }
    ],
    Healthcare: [
      {
        question: "What is HIPAA primarily concerned with?",
        options: ["Medical research", "Patient privacy", "Drug approval", "Hospital management"],
        correctAnswer: "Patient privacy",
        explanation: "HIPAA protects the privacy and security of health information."
      },
      {
        question: "What does EHR stand for?",
        options: ["Emergency Health Record", "Electronic Health Record", "Extended Health Report", "External Health Registry"],
        correctAnswer: "Electronic Health Record",
        explanation: "EHR is a digital version of a patient's paper chart."
      },
      {
        question: "What is the primary goal of evidence-based medicine?",
        options: ["Reduce costs", "Use best available evidence for decisions", "Increase efficiency", "Standardize procedures"],
        correctAnswer: "Use best available evidence for decisions",
        explanation: "Evidence-based medicine integrates clinical expertise with the best research evidence."
      },
      {
        question: "What does ICD stand for in healthcare?",
        options: ["Internal Care Department", "International Classification of Diseases", "Intensive Care Division", "Integrated Clinical Data"],
        correctAnswer: "International Classification of Diseases",
        explanation: "ICD is a medical classification system used for coding diagnoses and procedures."
      },
      {
        question: "What is the purpose of clinical trials?",
        options: ["Train doctors", "Test new treatments", "Reduce healthcare costs", "Manage patient records"],
        correctAnswer: "Test new treatments",
        explanation: "Clinical trials test the safety and effectiveness of new medical treatments."
      },
      {
        question: "What does PHI stand for in healthcare?",
        options: ["Public Health Information", "Protected Health Information", "Personal Health Insurance", "Primary Health Indicator"],
        correctAnswer: "Protected Health Information",
        explanation: "PHI refers to individually identifiable health information protected under HIPAA."
      },
      {
        question: "What is telemedicine?",
        options: ["Emergency medicine", "Remote healthcare delivery", "Surgical procedures", "Medical equipment"],
        correctAnswer: "Remote healthcare delivery",
        explanation: "Telemedicine uses technology to provide healthcare services remotely."
      },
      {
        question: "What is the primary purpose of medical coding?",
        options: ["Patient scheduling", "Billing and documentation", "Drug dispensing", "Equipment maintenance"],
        correctAnswer: "Billing and documentation",
        explanation: "Medical coding translates medical diagnoses and procedures into standardized codes."
      },
      {
        question: "What does CPR stand for?",
        options: ["Clinical Patient Review", "Cardiopulmonary Resuscitation", "Comprehensive Patient Record", "Critical Patient Response"],
        correctAnswer: "Cardiopulmonary Resuscitation",
        explanation: "CPR is an emergency procedure to restore blood circulation and breathing."
      },
      {
        question: "What is the main purpose of quality assurance in healthcare?",
        options: ["Reduce costs", "Ensure patient safety and care quality", "Increase efficiency", "Manage staff"],
        correctAnswer: "Ensure patient safety and care quality",
        explanation: "Quality assurance focuses on maintaining and improving patient care standards."
      }
    ],
    Sales: [
      {
        question: "What does CRM stand for in sales?",
        options: ["Customer Relationship Management", "Customer Revenue Model", "Client Resource Management", "Customer Retention Method"],
        correctAnswer: "Customer Relationship Management",
        explanation: "CRM systems help manage customer interactions and relationships throughout the sales process."
      },
      {
        question: "What is the primary goal of lead qualification?",
        options: ["Generate more leads", "Determine if a prospect is likely to buy", "Close deals faster", "Reduce marketing costs"],
        correctAnswer: "Determine if a prospect is likely to buy",
        explanation: "Lead qualification helps sales teams focus on prospects most likely to convert."
      },
      {
        question: "What does BANT stand for in sales qualification?",
        options: ["Budget, Authority, Need, Timeline", "Business, Analysis, Negotiation, Terms", "Buyer, Account, Network, Target", "Brand, Audience, Niche, Territory"],
        correctAnswer: "Budget, Authority, Need, Timeline",
        explanation: "BANT is a framework for qualifying sales prospects based on four key criteria."
      },
      {
        question: "What is the difference between a lead and a prospect?",
        options: ["No difference", "Leads are qualified, prospects are not", "Prospects are qualified, leads are not", "Leads are customers, prospects are not"],
        correctAnswer: "Prospects are qualified, leads are not",
        explanation: "A prospect is a qualified lead that has been determined to have potential for purchase."
      },
      {
        question: "What is consultative selling?",
        options: ["Selling consulting services", "Acting as an advisor to solve customer problems", "Selling to consultants", "Using consultants to sell"],
        correctAnswer: "Acting as an advisor to solve customer problems",
        explanation: "Consultative selling focuses on understanding customer needs and providing solutions."
      },
      {
        question: "What does closing ratio measure?",
        options: ["Number of calls made", "Percentage of prospects that become customers", "Revenue per sale", "Time to close deals"],
        correctAnswer: "Percentage of prospects that become customers",
        explanation: "Closing ratio indicates the effectiveness of converting prospects into customers."
      },
      {
        question: "What is the sales funnel?",
        options: ["A sales tool", "The process prospects go through to become customers", "A reporting method", "A territory management system"],
        correctAnswer: "The process prospects go through to become customers",
        explanation: "The sales funnel represents the journey from initial contact to closed deal."
      },
      {
        question: "What is objection handling?",
        options: ["Avoiding customer concerns", "Addressing customer concerns to move the sale forward", "Rejecting difficult customers", "Transferring calls to managers"],
        correctAnswer: "Addressing customer concerns to move the sale forward",
        explanation: "Objection handling involves addressing customer concerns to continue the sales process."
      },
      {
        question: "What does upselling mean?",
        options: ["Selling to new customers", "Selling additional or upgraded products to existing customers", "Increasing prices", "Selling online"],
        correctAnswer: "Selling additional or upgraded products to existing customers",
        explanation: "Upselling involves encouraging customers to purchase more expensive or additional items."
      },
      {
        question: "What is the purpose of a sales pipeline?",
        options: ["Store customer data", "Track deals through the sales process", "Generate reports", "Schedule meetings"],
        correctAnswer: "Track deals through the sales process",
        explanation: "A sales pipeline helps visualize and manage deals at different stages of the sales process."
      }
    ],
    Marketing: [
      {
        question: "What does CTR stand for in digital marketing?",
        options: ["Cost To Revenue", "Click Through Rate", "Customer Target Reach", "Content Traffic Ratio"],
        correctAnswer: "Click Through Rate",
        explanation: "CTR measures the percentage of people who click on a specific link."
      },
      {
        question: "What is A/B testing used for?",
        options: ["Budget allocation", "Comparing two versions", "Audience segmentation", "Content creation"],
        correctAnswer: "Comparing two versions",
        explanation: "A/B testing compares two versions to see which performs better."
      },
      {
        question: "What does SEO stand for?",
        options: ["Social Engagement Optimization", "Search Engine Optimization", "Sales Efficiency Operations", "Strategic Email Outreach"],
        correctAnswer: "Search Engine Optimization",
        explanation: "SEO is the practice of optimizing content to rank higher in search engine results."
      },
      {
        question: "What is the marketing funnel?",
        options: ["A sales tool", "Customer journey from awareness to purchase", "Budget allocation method", "Content creation process"],
        correctAnswer: "Customer journey from awareness to purchase",
        explanation: "The marketing funnel represents the customer's path from initial awareness to final purchase."
      },
      {
        question: "What does CPC stand for in advertising?",
        options: ["Cost Per Click", "Customer Per Campaign", "Content Per Channel", "Conversion Per Customer"],
        correctAnswer: "Cost Per Click",
        explanation: "CPC is the amount paid for each click in pay-per-click advertising."
      },
      {
        question: "What is brand positioning?",
        options: ["Logo placement", "How a brand is perceived relative to competitors", "Marketing budget allocation", "Social media strategy"],
        correctAnswer: "How a brand is perceived relative to competitors",
        explanation: "Brand positioning defines how a brand differentiates itself in the market."
      },
      {
        question: "What does ROI measure in marketing?",
        options: ["Reach of Investment", "Return on Investment", "Rate of Interaction", "Revenue of Initiative"],
        correctAnswer: "Return on Investment",
        explanation: "ROI measures the profitability of marketing investments."
      },
      {
        question: "What is content marketing?",
        options: ["Paid advertising", "Creating valuable content to attract customers", "Social media posting", "Email campaigns"],
        correctAnswer: "Creating valuable content to attract customers",
        explanation: "Content marketing focuses on creating and distributing valuable content to attract and retain customers."
      },
      {
        question: "What does CRM stand for?",
        options: ["Customer Relationship Management", "Content Resource Management", "Campaign Revenue Metrics", "Creative Resource Materials"],
        correctAnswer: "Customer Relationship Management",
        explanation: "CRM systems help manage interactions and relationships with customers."
      },
      {
        question: "What is the purpose of market segmentation?",
        options: ["Increase prices", "Divide market into distinct groups", "Reduce competition", "Expand globally"],
        correctAnswer: "Divide market into distinct groups",
        explanation: "Market segmentation helps target specific customer groups with tailored strategies."
      }
    ],
    Education: [
      {
        question: "What does LMS stand for?",
        options: ["Learning Management System", "Lesson Management Software", "Library Management System", "Learning Module Structure"],
        correctAnswer: "Learning Management System",
        explanation: "LMS is a software application for delivering educational courses."
      },
      {
        question: "What is scaffolding in education?",
        options: ["Building structures", "Temporary support for learning", "Assessment method", "Curriculum design"],
        correctAnswer: "Temporary support for learning",
        explanation: "Scaffolding provides temporary support to help students achieve learning goals."
      },
      {
        question: "What is differentiated instruction?",
        options: ["Teaching one way", "Adapting teaching to meet diverse needs", "Using technology", "Group learning only"],
        correctAnswer: "Adapting teaching to meet diverse needs",
        explanation: "Differentiated instruction tailors teaching methods to accommodate different learning styles and abilities."
      },
      {
        question: "What does IEP stand for in education?",
        options: ["Individual Education Plan", "Integrated Educational Program", "Interactive Electronic Platform", "Instructional Enhancement Process"],
        correctAnswer: "Individual Education Plan",
        explanation: "An IEP is a customized learning plan for students with disabilities."
      },
      {
        question: "What is formative assessment?",
        options: ["Final exam", "Ongoing evaluation during learning", "Standardized test", "Grade calculation"],
        correctAnswer: "Ongoing evaluation during learning",
        explanation: "Formative assessment provides feedback during the learning process to improve instruction."
      },
      {
        question: "What is the flipped classroom model?",
        options: ["Traditional lecture format", "Students learn content at home, practice in class", "Online-only learning", "Group projects only"],
        correctAnswer: "Students learn content at home, practice in class",
        explanation: "Flipped classroom reverses traditional teaching by having students learn content outside class."
      },
      {
        question: "What does STEM education focus on?",
        options: ["Science, Technology, Engineering, Mathematics", "Social studies only", "Language arts", "Physical education"],
        correctAnswer: "Science, Technology, Engineering, Mathematics",
        explanation: "STEM education integrates science, technology, engineering, and mathematics disciplines."
      },
      {
        question: "What is bloom's taxonomy used for?",
        options: ["Plant classification", "Classifying learning objectives", "Student grading", "Classroom management"],
        correctAnswer: "Classifying learning objectives",
        explanation: "Bloom's taxonomy categorizes learning objectives from basic recall to higher-order thinking."
      },
      {
        question: "What is project-based learning?",
        options: ["Memorizing facts", "Learning through real-world projects", "Taking tests", "Reading textbooks"],
        correctAnswer: "Learning through real-world projects",
        explanation: "Project-based learning engages students in solving real-world problems through extended projects."
      },
      {
        question: "What does RTI stand for in education?",
        options: ["Response to Intervention", "Reading and Technology Integration", "Real-Time Instruction", "Resource and Training Initiative"],
        correctAnswer: "Response to Intervention",
        explanation: "RTI is a framework for providing targeted support to struggling students."
      }
    ]
  };

  const questions = questionSets[industry] || questionSets.Technology;
  console.log('Using fallback questions for industry:', industry, 'Available industries:', Object.keys(questionSets));
  
  const result = [];
  for (let i = 0; i < 10; i++) {
    const baseQuestion = questions[i % questions.length];
    result.push({
      ...baseQuestion,
      question: i >= questions.length ? `${baseQuestion.question} (Advanced)` : baseQuestion.question
    });
  }
  
  return result;
}

module.exports = router;