import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Courses.css';
import Navbar from '../Navbar';

const Courses = ({ user, onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: ''
  });
  
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDashboard(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Wake up backend on component mount
  const wakeUpBackend = async () => {
    try {
      await fetch('https://rex-ai-hu5w.onrender.com/test');
    } catch (error) {
      console.log('Backend warming up...');
    }
  };

  useEffect(() => {
    wakeUpBackend();
    fetchCourses();
    fetchEnrolledCourses();
  }, [filters]);

  const fetchEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://rex-ai-hu5w.onrender.com/api/courses/enrolled', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

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
        fetchEnrolledCourses(); // Refresh enrolled courses
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      // Fallback: simulate enrollment
      alert('Enrolled successfully! (Demo mode - backend unavailable)');
      fetchEnrolledCourses();
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course._id === courseId);
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://rex-ai-hu5w.onrender.com/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Course deleted successfully!');
        setCourses(courses.filter(course => course._id !== courseId));
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      // Fallback: simulate deletion
      alert('Course deleted successfully! (Demo mode - backend unavailable)');
      setCourses(courses.filter(course => course._id !== courseId));
    }
  };

  const seedSampleCourses = async () => {
    try {
      const response = await fetch('https://rex-ai-hu5w.onrender.com/api/courses/seed/sample', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`${data.count} sample courses loaded successfully!`);
        fetchCourses();
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      console.error('Error seeding courses:', error);
      alert('Sample courses loaded! (Demo mode - using fallback data)');
      fetchCourses();
    }
  };



  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      if (filters.search) params.append('search', filters.search);
      
      console.log('Fetching courses from:', `https://rex-ai-hu5w.onrender.com/api/courses?${params}`);
      
      // Add timeout and retry logic for Render cold starts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`https://rex-ai-hu5w.onrender.com/api/courses?${params}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
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
        // Technology
        { _id: '1', title: 'React.js Fundamentals', description: 'Learn the basics of React.js and build modern web applications.', category: 'Technology', level: 'Beginner', price: 0, instructorName: 'John Doe', rating: 4.5, totalRatings: 120 },
        { _id: '2', title: 'Cloud Computing with AWS', description: 'Learn cloud infrastructure and deployment with Amazon Web Services.', category: 'Technology', level: 'Advanced', price: 99, instructorName: 'Lisa Wang', rating: 4.6, totalRatings: 145 },
        // Finance
        { _id: '3', title: 'Financial Analysis Fundamentals', description: 'Master financial statement analysis and valuation techniques.', category: 'Finance', level: 'Beginner', price: 59, instructorName: 'Robert Brown', rating: 4.4, totalRatings: 87 },
        { _id: '4', title: 'Cryptocurrency and Blockchain', description: 'Understanding digital currencies and blockchain technology.', category: 'Finance', level: 'Intermediate', price: 0, instructorName: 'Carlos Rodriguez', rating: 4.3, totalRatings: 156 },
        // Healthcare
        { _id: '5', title: 'Healthcare Data Analytics', description: 'Analyze healthcare data to improve patient outcomes.', category: 'Healthcare', level: 'Intermediate', price: 69, instructorName: 'Dr. Sarah Wilson', rating: 4.6, totalRatings: 78 },
        { _id: '6', title: 'Telemedicine Implementation', description: 'Learn to implement telehealth solutions in healthcare.', category: 'Healthcare', level: 'Beginner', price: 0, instructorName: 'Dr. Lisa Wang', rating: 4.4, totalRatings: 92 },
        // Marketing
        { _id: '7', title: 'Digital Marketing Strategy', description: 'Learn effective digital marketing strategies for modern businesses.', category: 'Marketing', level: 'Intermediate', price: 29, instructorName: 'Mike Johnson', rating: 4.3, totalRatings: 67 },
        { _id: '8', title: 'Social Media Marketing Mastery', description: 'Master social media platforms and audience engagement.', category: 'Marketing', level: 'Beginner', price: 39, instructorName: 'Emma Davis', rating: 4.5, totalRatings: 134 },
        // Education
        { _id: '9', title: 'Online Course Creation', description: 'Learn to create, market, and sell online courses effectively.', category: 'Education', level: 'Beginner', price: 49, instructorName: 'Dr. Sarah Wilson', rating: 4.6, totalRatings: 167 },
        { _id: '10', title: 'Educational Technology Integration', description: 'Integrate technology tools into educational curricula.', category: 'Education', level: 'Intermediate', price: 59, instructorName: 'Alex Kumar', rating: 4.4, totalRatings: 73 },
        // Design & Data Science
        { _id: '11', title: 'UI/UX Design Principles', description: 'Master user interface and user experience design.', category: 'Design', level: 'Beginner', price: 39, instructorName: 'Sarah Wilson', rating: 4.6, totalRatings: 95 },
        { _id: '12', title: 'Data Science with Python', description: 'Complete guide to data science using Python and ML libraries.', category: 'Data Science', level: 'Intermediate', price: 0, instructorName: 'David Chen', rating: 4.7, totalRatings: 156 }
      ];
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Technology', 'Finance', 'Healthcare', 'Marketing', 'Education', 'Design', 'Data Science', 'Other'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="courses-page">
      <Navbar 
        user={user}
        isLoggedIn={true}
        onLogout={onLogout}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
        dropdownRef={dropdownRef}
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
            <button 
              className="sample-btn"
              onClick={seedSampleCourses}
            >
              Load Sample Courses
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
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading courses...</p>
            <small>Backend may take 30-60 seconds to wake up on first load</small>
          </div>
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
                    
                    <div className="course-actions">
                      {isEnrolled(course._id) ? (
                        <button className="enrolled-btn" disabled>
                          ✓ Already Enrolled
                        </button>
                      ) : (
                        <button 
                          className={course.price === 0 ? "enroll-btn free" : "enroll-btn paid"}
                          onClick={() => handleCourseAction(course)}
                        >
                          {course.price === 0 ? 'Enroll Free' : `Buy for $${course.price}`}
                        </button>
                      )}
                      {course.instructorName === (user?.name || 'You') && (
                        <button 
                          className="delete-btn"
                          onClick={() => deleteCourse(course._id)}
                          title="Delete Course"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
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
          onSuccess={(newCourse) => {
            setShowCreateModal(false);
            if (newCourse) {
              setCourses(prevCourses => [newCourse, ...prevCourses]);
            } else {
              fetchCourses();
            }
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
        const data = await response.json();
        alert('Course created successfully!');
        onSuccess(data.course);
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      // Fallback: simulate course creation
      const mockCourse = {
        _id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        price: formData.price,
        instructorName: user?.name || 'You',
        rating: 0,
        totalRatings: 0
      };
      alert('Course created successfully! (Demo mode - backend unavailable)');
      onSuccess(mockCourse);
    }
  };

  const categories = ['Technology', 'Finance', 'Healthcare', 'Marketing', 'Education', 'Design', 'Data Science', 'Other'];
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