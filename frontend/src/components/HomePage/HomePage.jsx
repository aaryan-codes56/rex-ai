import React, { useState, useEffect } from 'react';
import './HomePage.css';
import Navbar from '../Navbar';

const HomePage = ({ onSignIn, onSignUp, user, isLoggedIn, onLogout, showDashboard, setShowDashboard, dropdownRef, onNavigate }) => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in-section');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const features = [
    {
      icon: "🎯",
      title: "AI Career Guidance",
      description: "Get personalized career recommendations powered by advanced AI algorithms"
    },
    {
      icon: "📚",
      title: "Course Recommendations",
      description: "Discover curated courses tailored to your career goals and skill gaps"
    },
    {
      icon: "📄",
      title: "Smart Resume Builder",
      description: "Create professional resumes with AI-powered enhancement suggestions"
    },
    {
      icon: "🔍",
      title: "Skill Assessment",
      description: "Evaluate your current skills and identify areas for improvement"
    }
  ];

  const stats = [
    { number: "50+", label: "Industries Covered" },
    { number: "1000+", label: "Interview Questions" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "AI Support" }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Tell us about your background, skills, and career aspirations"
    },
    {
      number: "02",
      title: "Get AI Analysis",
      description: "Our AI analyzes your profile and market trends to provide insights"
    },
    {
      number: "03",
      title: "Receive Recommendations",
      description: "Get personalized career paths, courses, and skill development plans"
    },
    {
      number: "04",
      title: "Track Your Progress",
      description: "Monitor your growth and adjust your career strategy as you evolve"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      company: "Tech Corp",
      text: "RexAI helped me transition from marketing to tech. The personalized roadmap was exactly what I needed to make the career switch successfully."
    },
    {
      name: "Michael Chen",
      role: "Data Scientist",
      company: "Analytics Pro",
      text: "The AI recommendations were spot-on. I landed my dream job within 3 months of following RexAI's guidance and course suggestions."
    },
    {
      name: "Emily Rodriguez",
      role: "Product Manager",
      company: "Innovation Labs",
      text: "RexAI's resume builder and interview prep helped me increase my interview success rate by 80%. Absolutely game-changing platform."
    }
  ];

  const faqs = [
    {
      question: "What makes RexAI unique?",
      answer: "RexAI combines advanced AI algorithms with real-time market data to provide personalized career guidance. Unlike generic platforms, we analyze your unique profile and provide tailored recommendations."
    },
    {
      question: "How does RexAI create tailored content?",
      answer: "Our AI analyzes your skills, experience, goals, and current market trends to generate personalized career paths, course recommendations, and resume enhancements specific to your situation."
    },
    {
      question: "How accurate are the insights?",
      answer: "Our AI models are trained on millions of career data points and maintain a 95% accuracy rate in career predictions and recommendations, validated by user success stories."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use enterprise-grade encryption and follow strict data privacy protocols. Your personal information is never shared with third parties without your explicit consent."
    },
    {
      question: "Can I edit AI-generated content?",
      answer: "Absolutely! All AI-generated content including resumes, cover letters, and career plans can be fully customized and edited to match your preferences and style."
    }
  ];

  return (
    <div className="homepage">
      <Navbar 
        user={user}
        isLoggedIn={isLoggedIn}
        onSignIn={onSignIn}
        onSignUp={onSignUp}
        onLogout={onLogout}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
        dropdownRef={dropdownRef}
        onNavigate={onNavigate}
      />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">
            Your AI Career Coach for 
            <span className="gradient-text" data-text=" Professional Success"> Professional Success</span>
          </h1>
          <p className="hero-subtitle">
            Unlock your potential with personalized career guidance, smart course recommendations, 
            and AI-powered resume building - all in one intelligent platform.
          </p>
          {!isLoggedIn && (
            <div className="hero-buttons">
              <button className="btn-primary" onClick={onSignUp}>Get Started</button>
              <button className="btn-secondary" onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}>Explore Features</button>
            </div>
          )}
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="features-section fade-in-section">
        <div className="container">
          <h2 className="section-title">Powerful Features for Your Success</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card"
                style={{ '--index': index }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.setProperty('--mouse-x', '50%');
                  e.currentTarget.style.setProperty('--mouse-y', '50%');
                }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="stats-section fade-in-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works-section fade-in-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="step-item"
                style={{ '--index': index }}
              >
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section fade-in-section">
        <div className="container">
          <h2 className="section-title">What Our Users Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="testimonial-card"
                style={{ '--index': index }}
              >
                <div className="testimonial-avatar">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="testimonial-content">
                  <p className="testimonial-text">"{testimonial.text}"</p>
                  <div className="testimonial-author">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section fade-in-section">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-container">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button 
                  className={`faq-question ${openFAQ === index ? 'active' : ''}`}
                  onClick={() => toggleFAQ(index)}
                >
                  {faq.question}
                  <span className="faq-icon">{openFAQ === index ? '−' : '+'}</span>
                </button>
                <div className={`faq-answer ${openFAQ === index ? 'open' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Accelerate Your Career?</h2>
          <p className="cta-subtitle">
            Join thousands of professionals who have transformed their careers with RexAI
          </p>
          <button className="cta-button" onClick={onSignUp}>Start Your Journey Today →</button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;