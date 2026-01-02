import React, { useState, useEffect } from 'react';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    industry: user?.industry || '',
    experience: user?.experience || '',
    skills: user?.skills || '',
    bio: user?.bio || ''
  });


  React.useEffect(() => {
    if (user) {
      setFormData({
        industry: user.industry || '',
        experience: user.experience || '',
        skills: user.skills || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
    'Sales', 'Manufacturing', 'Retail', 'Consulting', 'Media', 'Data Science'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();



    if (!formData.industry || !formData.experience || !formData.skills || !formData.bio) {

      alert('Please fill in all required fields');
      return;
    }

    if (onSave) {

      try {
        await onSave(formData);

      } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving profile. Please try again.');
      }
    } else {

      alert('Error: Save function not available');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Complete Your Profile</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Industry</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
            >
              <option value="">Select Industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g., 3"
              min="0"
              max="50"
              required
            />
          </div>

          <div className="form-group">
            <label>Skills (comma-separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Professional Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about your professional background..."
              rows="4"
              required
            />
          </div>

          <button
            type="submit"
            className="save-btn"
          >
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;