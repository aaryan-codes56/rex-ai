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

  useEffect(() => {
    // Mock data - replace with API calls
    setStats({
      averageScore: 78,
      questionsPracticed: 145,
      latestScore: 85,
      performanceData: [
        { date: '2024-01-01', score: 65 },
        { date: '2024-01-05', score: 72 },
        { date: '2024-01-10', score: 78 },
        { date: '2024-01-15', score: 81 },
        { date: '2024-01-20', score: 85 }
      ]
    });

    setRecentQuizzes([
      { id: 1, score: 85, date: '2024-01-20', questions: 10 },
      { id: 2, score: 78, date: '2024-01-15', questions: 10 },
      { id: 3, score: 72, date: '2024-01-10', questions: 8 },
      { id: 4, score: 81, date: '2024-01-05', questions: 10 },
      { id: 5, score: 65, date: '2024-01-01', questions: 10 }
    ]);
  }, []);

  const startQuiz = () => {
    // Mock quiz questions - replace with API call
    const mockQuestions = [
      {
        question: "What is the difference between let and var in JavaScript?",
        options: [
          "No difference",
          "let has block scope, var has function scope",
          "var has block scope, let has function scope",
          "Both have global scope"
        ],
        correct: 1
      },
      {
        question: "Which HTTP method is used to update a resource?",
        options: ["GET", "POST", "PUT", "DELETE"],
        correct: 2
      },
      {
        question: "What does CSS stand for?",
        options: [
          "Computer Style Sheets",
          "Cascading Style Sheets",
          "Creative Style Sheets",
          "Colorful Style Sheets"
        ],
        correct: 1
      }
    ];

    setCurrentQuiz({
      questions: mockQuestions,
      answers: new Array(mockQuestions.length).fill(''),
      score: 0
    });
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setShowQuiz(true);
    setQuizResults(null);
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

  const finishQuiz = () => {
    let score = 0;
    currentQuiz.questions.forEach((question, index) => {
      if (currentQuiz.answers[index] === question.correct) {
        score++;
      }
    });
    
    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
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
                <h2>Interview Quiz</h2>
                <div className="quiz-progress">
                  Question {currentQuestion + 1} of {currentQuiz.questions.length}
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
                  className="nav-btn" 
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </button>
                <button 
                  className="nav-btn primary" 
                  onClick={nextQuestion}
                  disabled={selectedAnswer === ''}
                >
                  {currentQuestion === currentQuiz.questions.length - 1 ? 'Finish' : 'Next'}
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

        {/* Stats Cards */}
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

        {/* Performance Chart */}
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

        {/* Recent Quizzes */}
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
      </div>
    </div>
  );
};

export default InterviewPrep;