import React from 'react';
import './ProfilePage.css';
import Navbar from '../Navbar';

const ProfilePage = ({ user, onLogout, onEditProfile }) => {
  const skillsArray = user.skills ? user.skills.split(',').map(skill => skill.trim()) : [];

  return (
    <div className="profile-page">
      <Navbar 
        user={user}
        isLoggedIn={true}
        onLogout={onLogout}
        showProfile={true}
      />
      
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
          <button className="edit-btn" onClick={onEditProfile}>
            Edit Profile
          </button>
        </div>

        <div className="profile-details">
          <div className="detail-card">
            <h3>Industry</h3>
            <p>{user.industry || 'Not specified'}</p>
          </div>

          <div className="detail-card">
            <h3>Years of Experience</h3>
            <p>{user.experience ? `${user.experience} years` : 'Not specified'}</p>
          </div>

          <div className="detail-card">
            <h3>Skills</h3>
            <div className="skills-container">
              {skillsArray.length > 0 ? (
                skillsArray.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))
              ) : (
                <p>No skills added</p>
              )}
            </div>
          </div>

          <div className="detail-card bio-card">
            <h3>Professional Bio</h3>
            <p>{user.bio || 'No bio added'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;