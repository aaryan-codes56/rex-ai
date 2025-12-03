import React, { useState, useEffect, useRef } from 'react';
import './InterviewPrep.css';
import Navbar from '../Navbar';

const InterviewPrep = ({ user, onLogout }) => {
  const [showDashboard, setShowDashboard] = useState(false);
  const dropdownRef = useRef(null);
  const [stats, setStats] = useState({
    averageScore: 0,
    questionsPracticed: 0,
    latestScore: 0,
    performanceData: []
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDashboard(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show realistic data for new users
    setStats({
      averageScore: 0,
      questionsPracticed: 0,
      latestScore: 0,
      performanceData: []
    });

    setRecentQuizzes([]);
  }, []);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Starting quiz for user industry:', user?.industry);
      
      const response = await fetch('https://rex-ai-hu5w.onrender.com/api/interview/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let questions;
      if (response.ok) {
        const data = await response.json();
        console.log('Received questions:', data);
        
        if (data.questions && Array.isArray(data.questions)) {
          questions = data.questions.map((q, index) => ({
            question: q.question,
            options: q.options,
            correct: q.options.indexOf(q.correctAnswer),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          }));
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }
      
      setCurrentQuiz({
        questions,
        answers: new Array(questions.length).fill(''),
        score: 0
      });
      setCurrentQuestion(0);
      setSelectedAnswer('');
      setShowQuiz(true);
      setQuizResults(null);
    } catch (error) {
      console.error('Error generating questions:', error);
      
      // Industry-specific fallback questions
      const industry = user?.industry || 'Technology';
      console.log('Using fallback questions for:', industry);
      
      const fallbackQuestions = getFallbackQuestions(industry);
      
      setCurrentQuiz({
        questions: fallbackQuestions,
        answers: new Array(fallbackQuestions.length).fill(''),
        score: 0
      });
      setCurrentQuestion(0);
      setSelectedAnswer('');
      setShowQuiz(true);
      setQuizResults(null);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackQuestions = (industry) => {
    const questionSets = {
      Technology: [
        { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct: 1, correctAnswer: "O(log n)", explanation: "Binary search divides the search space in half with each iteration." },
        { question: "Which design pattern ensures a class has only one instance?", options: ["Factory", "Singleton", "Observer", "Strategy"], correct: 1, correctAnswer: "Singleton", explanation: "Singleton pattern restricts instantiation of a class to one object." }
      ],
      Finance: [
        { question: "What is the Capital Asset Pricing Model (CAPM) used for?", options: ["Calculate interest rates", "Determine expected return", "Measure inflation", "Assess credit risk"], correct: 1, correctAnswer: "Determine expected return", explanation: "CAPM calculates the expected return of an asset based on its risk." },
        { question: "What does NPV stand for?", options: ["Net Present Value", "Net Profit Value", "New Product Value", "Net Portfolio Value"], correct: 0, correctAnswer: "Net Present Value", explanation: "NPV is the difference between present value of cash inflows and outflows." }
      ],
      Healthcare: [
        { question: "What is HIPAA primarily concerned with?", options: ["Medical research", "Patient privacy", "Drug approval", "Hospital management"], correct: 1, correctAnswer: "Patient privacy", explanation: "HIPAA protects the privacy and security of health information." },
        { question: "What does EHR stand for?", options: ["Emergency Health Record", "Electronic Health Record", "Extended Health Report", "External Health Registry"], correct: 1, correctAnswer: "Electronic Health Record", explanation: "EHR is a digital version of a patient's paper chart." }
      ],
      Marketing: [
        { question: "What does CTR stand for in digital marketing?", options: ["Cost To Revenue", "Click Through Rate", "Customer Target Reach", "Content Traffic Ratio"], correct: 1, correctAnswer: "Click Through Rate", explanation: "CTR measures the percentage of people who click on a specific link." },
        { question: "What is A/B testing used for?", options: ["Budget allocation", "Comparing two versions", "Audience segmentation", "Content creation"], correct: 1, correctAnswer: "Comparing two versions", explanation: "A/B testing compares two versions to see which performs better." }
      ],
      Education: [
        { question: "What does LMS stand for?", options: ["Learning Management System", "Lesson Management Software", "Library Management System", "Learning Module Structure"], correct: 0, correctAnswer: "Learning Management System", explanation: "LMS is a software application for delivering educational courses." },
        { question: "What is scaffolding in education?", options: ["Building structures", "Temporary support for learning", "Assessment method", "Curriculum design"], correct: 1, correctAnswer: "Temporary support for learning", explanation: "Scaffolding provides temporary support to help students achieve learning goals." }
      ]
    };
    
    return questionSets[industry] || questionSets.Technology;
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = [...currentQuiz.answers];
    newAnswers[currentQuestion] = answerIndex;
    setCurrentQuiz({
      ...currentQuiz,
      answers: newAnswers
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(currentQuiz.answers[currentQuestion + 1] || '');
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(currentQuiz.answers[currentQuestion - 1] || '');
    }
  };

  const finishQuiz = async () => {
    let score = 0;
    currentQuiz.questions.forEach((question, index) => {
      if (currentQuiz.answers[index] === question.correct) {
        score++;
      }
    });
    
    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    
    // Save results to backend
    try {
      const token = localStorage.getItem('token');
      const answers = currentQuiz.answers.map(answerIndex => 
        answerIndex !== '' ? currentQuiz.questions[0].options[answerIndex] : ''
      );
      
      await fetch('https://rex-ai-hu5w.onrender.com/api/interview/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questions: currentQuiz.questions,
          answers,
          score
        })
      });
    } catch (error) {
      console.error('Error saving results:', error);
    }
    
    setQuizResults({
      score: percentage,
      correct: score,
      total: currentQuiz.questions.length
    });
  };

  const closeQuiz = () => {
    setShowQuiz(false);
    setCurrentQuiz(null);
    setQuizResults(null);
  };

  if (showQuiz) {
    return (
      <div className="interview-prep">
        <Navbar 
          user={user} 
          isLoggedIn={true} 
          onLogout={onLogout}
          showDashboard={showDashboard}
          setShowDashboard={setShowDashboard}
          dropdownRef={dropdownRef}
        />
        
        <div className="quiz-container">
          {!quizResults ? (
            <div className="quiz-content">
              <div className="quiz-header">
                <div className="quiz-header-left">
                  <button className="back-btn" onClick={closeQuiz}>
                    ← Back
                  </button>
                  <h2>Interview Quiz</h2>
                </div>
                <div className="quiz-progress">
                  <span className="progress-text">Question {currentQuestion + 1} of {currentQuiz.questions.length}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${((currentQuestion + 1) / currentQuiz.questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="question-card">
                <h3>{currentQuiz.questions[currentQuestion].question}</h3>
                <div className="options-list">
                  {currentQuiz.questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      className={`option-btn ${selectedAnswer === index ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="quiz-navigation">
                <button 
                  className="nav-btn secondary" 
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                >
                  ← Previous
                </button>
                <div className="nav-center">
                  <span className="question-counter">{currentQuestion + 1}/{currentQuiz.questions.length}</span>
                </div>
                <button 
                  className="nav-btn primary" 
                  onClick={nextQuestion}
                  disabled={selectedAnswer === ''}
                >
                  {currentQuestion === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next →'}
                </button>
              </div>
            </div>
          ) : (
            <div className="quiz-results">
              <h2>Quiz Complete!</h2>
              <div className="score-display">
                <div className="score-circle">
                  <span className="score-number">{quizResults.score}%</span>
                </div>
                <p>You got {quizResults.correct} out of {quizResults.total} questions correct</p>
              </div>
              <button className="close-btn" onClick={closeQuiz}>
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="interview-prep">
      <Navbar 
        user={user} 
        isLoggedIn={true} 
        onLogout={onLogout}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
        dropdownRef={dropdownRef}
      />
      
      <div className="prep-container">
        <div className="prep-header">
          <h1>Interview Preparation</h1>
          <button className="start-quiz-btn" onClick={startQuiz}>
            Start Quiz
          </button>
        </div>

        {/* Available Quiz Types */}
        <div className="quiz-types-section">
          <h2>Available Quiz Categories</h2>
          <div className="quiz-types-grid">
            <div className={`quiz-type-card ${loading ? 'loading' : ''}`} onClick={loading ? null : startQuiz}>
              <div className="quiz-type-icon">💻</div>
              <div className="quiz-type-info">
                <h3>{user?.industry || 'Technology'} Interview</h3>
                <p>Industry-specific technical questions powered by AI</p>
                <div className="quiz-details">
                  <span className="question-count">10 Questions</span>
                  <span className="difficulty">Mixed Difficulty</span>
                </div>
              </div>
              <div className="start-arrow">{loading ? '⏳' : '→'}</div>
            </div>
            
            <div className="quiz-type-card coming-soon">
              <div className="quiz-type-icon">🧠</div>
              <div className="quiz-type-info">
                <h3>Behavioral Interview</h3>
                <p>Soft skills and behavioral questions</p>
                <div className="quiz-details">
                  <span className="question-count">8 Questions</span>
                  <span className="difficulty">Coming Soon</span>
                </div>
              </div>
            </div>
            
            <div className="quiz-type-card coming-soon">
              <div className="quiz-type-icon">📈</div>
              <div className="quiz-type-info">
                <h3>Case Study</h3>
                <p>Problem-solving scenarios</p>
                <div className="quiz-details">
                  <span className="question-count">5 Scenarios</span>
                  <span className="difficulty">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Only show if user has taken quizzes */}
        {stats.questionsPracticed > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>Average Score</h3>
                <p className="stat-value">{stats.averageScore}%</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">❓</div>
              <div className="stat-info">
                <h3>Questions Practiced</h3>
                <p className="stat-value">{stats.questionsPracticed}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <h3>Latest Score</h3>
                <p className="stat-value">{stats.latestScore}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Chart - Only show if user has data */}
        {stats.performanceData.length > 0 && (
          <div className="chart-section">
            <h2>Performance Trend</h2>
            <div className="performance-chart">
              {stats.performanceData.map((data, index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar-fill" 
                    style={{ height: `${data.score}%` }}
                  ></div>
                  <span className="bar-label">{data.score}%</span>
                  <span className="bar-date">{new Date(data.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Quizzes - Only show if user has taken quizzes */}
        {recentQuizzes.length > 0 && (
          <div className="quizzes-section">
            <h2>Recent Quizzes</h2>
            <div className="quizzes-list">
              {recentQuizzes.map((quiz) => (
                <div key={quiz.id} className="quiz-item">
                  <div className="quiz-score">
                    <span className="score">{quiz.score}%</span>
                  </div>
                  <div className="quiz-details">
                    <p className="quiz-date">{new Date(quiz.date).toLocaleDateString()}</p>
                    <p className="quiz-questions">{quiz.questions} questions attempted</p>
                  </div>
                  <div className={`quiz-badge ${quiz.score >= 80 ? 'excellent' : quiz.score >= 60 ? 'good' : 'needs-improvement'}`}>
                    {quiz.score >= 80 ? 'Excellent' : quiz.score >= 60 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Getting Started Message for New Users */}
        {recentQuizzes.length === 0 && (
          <div className="getting-started">
            <div className="welcome-card">
              <div className="welcome-icon">🚀</div>
              <h2>Ready to Start Your Interview Prep?</h2>
              <p>Take your first {user?.industry || 'Technology'} industry quiz to get personalized insights and track your progress.</p>
              <button className="get-started-btn" onClick={startQuiz} disabled={loading}>
                {loading ? '⏳ Generating Questions...' : 'Take Your First Quiz'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;