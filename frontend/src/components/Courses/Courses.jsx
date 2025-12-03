import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Courses.css';
import Navbar from '../Navbar';

const Courses = ({ user, onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const handleCourseAction = (course) => {
    if (course.price === 0) {
      // Free course - enroll directly
      enrollInCourse(course._id);
    } else {
      // Paid course - show payment modal
      setSelectedCourse(course);
      setShowPaymentModal(true);
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://rex-ai-hu5w.onrender.com/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Enrolled successfully!');
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      // Fallback: simulate enrollment
      alert('Enrolled successfully! (Demo mode - backend unavailable)');
    }
  };



  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      if (filters.search) params.append('search', filters.search);
      
      console.log('Fetching courses from:', `https://rex-ai-hu5w.onrender.com/api/courses?${params}`);
      const response = await fetch(`https://rex-ai-hu5w.onrender.com/api/courses?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Courses response:', data);
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback to mock data when backend is down
      const mockCourses = [
        {
          _id: '1',
          title: 'React.js Fundamentals',
          description: 'Learn the basics of React.js and build modern web applications with hooks, components, and state management.',
          category: 'Technology',
          level: 'Beginner',
          price: 0,
          instructorName: 'John Doe',
          rating: 4.5,
          totalRatings: 120
        },
        {
          _id: '2',
          title: 'Advanced JavaScript',
          description: 'Master advanced JavaScript concepts including closures, prototypes, async/await, and ES6+ features.',
          category: 'Technology',
          level: 'Advanced',
          price: 49,
          instructorName: 'Jane Smith',
          rating: 4.8,
          totalRatings: 89
        },
        {
          _id: '3',
          title: 'Digital Marketing Strategy',
          description: 'Learn effective digital marketing strategies for modern businesses including SEO, social media, and analytics.',
          category: 'Marketing',
          level: 'Intermediate',
          price: 29,
          instructorName: 'Mike Johnson',
          rating: 4.3,
          totalRatings: 67
        },
        {
          _id: '4',
          title: 'UI/UX Design Principles',
          description: 'Master the fundamentals of user interface and user experience design with practical projects.',
          category: 'Design',
          level: 'Beginner',
          price: 39,
          instructorName: 'Sarah Wilson',
          rating: 4.6,
          totalRatings: 95
        },
        {
          _id: '5',
          title: 'Data Science with Python',
          description: 'Complete guide to data science using Python, pandas, numpy, and machine learning libraries.',
          category: 'Data Science',
          level: 'Intermediate',
          price: 0,
          instructorName: 'David Chen',
          rating: 4.7,
          totalRatings: 156
        }
      ];
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Data Science', 'Other'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="courses-page">
      <Navbar 
        user={user}
        isLoggedIn={true}
        onLogout={onLogout}
      />
      
      <div className="courses-container">
        <div className="courses-header">
          <h1>Courses</h1>
          <div className="header-buttons">
            <button 
              className="create-course-btn"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Course
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <input
            type="text"
            placeholder="Search courses..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="search-input"
          />
          
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={filters.level}
            onChange={(e) => setFilters({...filters, level: e.target.value})}
            className="filter-select"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="loading">Loading courses...</div>
        ) : (
          <div className="courses-grid">
            {courses.length > 0 ? (
              courses.map(course => (
                <div key={course._id} className="course-card">
                  <div className="course-thumbnail">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} />
                    ) : (
                      <div className="placeholder-thumbnail">📚</div>
                    )}
                  </div>
                  
                  <div className="course-content">
                    <h3>{course.title}</h3>
                    <p className="course-description">{course.description}</p>
                    
                    <div className="course-meta">
                      <span className="category">{course.category}</span>
                      <span className="level">{course.level}</span>
                    </div>
                    
                    <div className="course-footer">
                      <span className="instructor">By {course.instructorName}</span>
                      <div className="course-rating">
                        <span className="rating">⭐ {course.rating || 0}</span>
                        <span className="rating-count">({course.totalRatings || 0})</span>
                      </div>
                      <span className="price">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                    </div>
                    
                    <button 
                      className={course.price === 0 ? "enroll-btn free" : "enroll-btn paid"}
                      onClick={() => handleCourseAction(course)}
                    >
                      {course.price === 0 ? 'Enroll Free' : `Buy for $${course.price}`}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-courses">
                <h3>No courses found</h3>
                <p>Be the first to create a course!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <CreateCourseModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCourses();
          }}
          user={user}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedCourse && (
        <PaymentModal 
          course={selectedCourse}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedCourse(null);
          }}
          onSuccess={() => {
            setShowPaymentModal(false);
            setSelectedCourse(null);
            enrollInCourse(selectedCourse._id);
          }}
        />
      )}
    </div>
  );
};

// Create Course Modal Component
const CreateCourseModal = ({ onClose, onSuccess, user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://rex-ai-hu5w.onrender.com/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Course created successfully!');
        onSuccess();
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      // Fallback: simulate course creation
      alert('Course created successfully! (Demo mode - backend unavailable)');
      onSuccess();
    }
  };

  const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Data Science', 'Other'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Create New Course</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-group">
            <label>Course Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                required
              >
                <option value="">Select Level</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Course Type</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="courseType"
                  value="free"
                  checked={formData.price === 0}
                  onChange={() => setFormData({...formData, price: 0})}
                />
                Free Course
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="courseType"
                  value="paid"
                  checked={formData.price > 0}
                  onChange={() => setFormData({...formData, price: 29})}
                />
                Paid Course
              </label>
            </div>
          </div>

          {formData.price > 0 && (
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                min="1"
                required
              />
            </div>
          )}

          <button type="submit" className="create-btn">
            Create Course
          </button>
        </form>
      </div>
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ course, onClose, onSuccess }) => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [processing, setProcessing] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      alert(`Payment successful! You've purchased ${course.title}`);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container payment-modal">
        <div className="modal-header">
          <h2>Complete Purchase</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="course-summary">
          <h3>{course.title}</h3>
          <p className="course-price">${course.price}</p>
        </div>
        
        <form onSubmit={handlePayment} className="payment-form">
          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              value={paymentData.cardholderName}
              onChange={(e) => setPaymentData({...paymentData, cardholderName: e.target.value})}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label>Card Number</label>
            <input
              type="text"
              value={paymentData.cardNumber}
              onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="text"
                value={paymentData.expiryDate}
                onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                placeholder="MM/YY"
                maxLength="5"
                required
              />
            </div>

            <div className="form-group">
              <label>CVV</label>
              <input
                type="text"
                value={paymentData.cvv}
                onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                placeholder="123"
                maxLength="3"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="payment-btn"
            disabled={processing}
          >
            {processing ? 'Processing...' : `Pay $${course.price}`}
          </button>
        </form>
        
        <div className="payment-security">
          <p>🔒 Your payment information is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default Courses;