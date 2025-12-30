import React, { useState, useEffect, useRef } from 'react';
import './ResumeBuilder.css';
import Navbar from '../Navbar';
import API_BASE_URL from '../../config';

const ResumeBuilder = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('form');
  const [showDashboard, setShowDashboard] = useState(false);
  const dropdownRef = useRef(null);

  const [resumeData, setResumeData] = useState({
    contactInfo: {
      email: user.email || '',
      mobile: '',
      linkedin: ''
    },
    summary: '',
    skills: user.skills || '',
    experience: [
      {
        position: '',
        company: '',
        startDate: '',
        endDate: '',
        description: '',
        isCurrent: false
      }
    ]
  });
  const [savedResumes, setSavedResumes] = useState([]);
  const [currentResumeId, setCurrentResumeId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDashboard(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContactChange = (field, value) => {
    setResumeData({
      ...resumeData,
      contactInfo: {
        ...resumeData.contactInfo,
        [field]: value
      }
    });
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...resumeData.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    };
    setResumeData({
      ...resumeData,
      experience: newExperience
    });
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          position: '',
          company: '',
          startDate: '',
          endDate: '',
          description: '',
          isCurrent: false
        }
      ]
    });
  };

  const removeExperience = (index) => {
    const newExperience = resumeData.experience.filter((_, i) => i !== index);
    setResumeData({
      ...resumeData,
      experience: newExperience
    });
  };

  const saveResume = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          personalInfo: resumeData.contactInfo,
          experience: resumeData.experience,
          skills: resumeData.skills,
          summary: resumeData.summary
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentResumeId(data.resume.id);
        alert('Resume saved successfully!');
        fetchResumes();
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      const mockResume = {
        id: Date.now().toString(),
        personalInfo: resumeData.contactInfo,
        experience: resumeData.experience,
        skills: resumeData.skills,
        summary: resumeData.summary,
        createdAt: new Date().toISOString()
      };
      setSavedResumes(prev => [...prev, mockResume]);
      alert('Resume saved! (Demo mode)');
    }
  };

  const deleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/resume/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Resume deleted successfully!');
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Resume deleted! (Demo mode)');
    }

    setSavedResumes(savedResumes.filter(r => r.id !== resumeId));
    if (currentResumeId === resumeId) {
      setCurrentResumeId(null);
    }
  };

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/resume`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedResumes(data.resumes || []);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const generateMarkdown = () => {
    const skillsArray = resumeData.skills.split(',').map(s => s.trim()).filter(s => s);

    const contactLine = [
      resumeData.contactInfo.email,
      resumeData.contactInfo.mobile,
      resumeData.contactInfo.linkedin
    ].filter(Boolean).join(' | ');

    return `# ${user.name}
${contactLine}

## Professional Summary
${resumeData.summary}

## Skills
${skillsArray.map(skill => `- ${skill}`).join('\n')}

## Work Experience
${resumeData.experience.map(exp => `
### ${exp.position} at ${exp.company}
**${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}**

${exp.description}
`).join('\n')}`;
  };

  const downloadPDF = () => {
    const resumeContent = generateMarkdown();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${user.name} - Resume</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; font-size: 14px; }
          h1 { color: #333; border-bottom: 2px solid #333; font-size: 24px; padding-bottom: 10px; }
          h2 { color: #666; margin-top: 25px; border-bottom: 1px solid #ddd; font-size: 18px; }
          h3 { color: #444; margin-top: 15px; font-size: 16px; }
          ul { padding-left: 20px; }
          p { margin-bottom: 8px; }
        </style>
      </head>
      <body>
        ${resumeContent.replace(/\n/g, '<br>').replace(/# /g, '<h1>').replace(/<br><h1>/g, '<h1>').replace(/## /g, '</h1><h2>').replace(/### /g, '</h2><h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/- /g, '<li>').replace(/<li>/g, '<ul><li>').replace(/<\/li><br>/g, '</li></ul><br>')}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user.name.replace(/\s+/g, '_')}_Resume.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchResumes();
    }
  }, [activeTab]);

  return (
    <div className="resume-builder">
      <Navbar
        user={user}
        isLoggedIn={true}
        onLogout={onLogout}
        showDashboard={showDashboard}
        setShowDashboard={setShowDashboard}
        dropdownRef={dropdownRef}
      />

      <div className="resume-container">
        <div className="resume-header">
          <h1>Resume Builder</h1>
          <div className="header-actions">
            <div className="tab-buttons">
              <button
                className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
                onClick={() => setActiveTab('form')}
              >
                Form Mode
              </button>
              <button
                className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                Preview
              </button>
              <button
                className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                onClick={() => setActiveTab('saved')}
              >
                Saved Resumes
              </button>
            </div>
            <div className="action-buttons">
              {activeTab === 'form' && (
                <button className="save-btn" onClick={saveResume}>
                  💾 Save Resume
                </button>
              )}
              {(activeTab === 'preview' || activeTab === 'form') && (
                <button className="download-btn" onClick={downloadPDF}>
                  📄 Download Resume
                </button>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'saved' && (
          <div className="saved-resumes-section">
            <h2>Your Saved Resumes</h2>
            {savedResumes.length === 0 ? (
              <div className="no-resumes">
                <p>No saved resumes yet. Create your first resume using the Form Mode!</p>
              </div>
            ) : (
              <div className="resumes-grid">
                {savedResumes.map((resume) => (
                  <div key={resume.id} className="resume-card">
                    <div className="resume-header">
                      <h3>Resume</h3>
                      <span className="resume-date">
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="resume-preview">
                      <p><strong>Email:</strong> {resume.personalInfo?.email || 'Not provided'}</p>
                      <p><strong>Skills:</strong> {resume.skills || 'Not provided'}</p>
                      <p><strong>Experience:</strong> {resume.experience?.length || 0} entries</p>
                    </div>
                    <div className="resume-actions">
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setResumeData({
                            contactInfo: resume.personalInfo || { email: '', mobile: '', linkedin: '' },
                            summary: resume.summary || '',
                            skills: resume.skills || '',
                            experience: resume.experience || [{ position: '', company: '', startDate: '', endDate: '', description: '', isCurrent: false }]
                          });
                          setCurrentResumeId(resume.id);
                          setActiveTab('form');
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteResume(resume.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="preview-section">
            <div className="resume-preview-content">
              <h1>{user.name}</h1>
              <p>
                {[
                  resumeData.contactInfo.email,
                  resumeData.contactInfo.mobile,
                  resumeData.contactInfo.linkedin
                ].filter(Boolean).join(' | ')}
              </p>

              <h2>Professional Summary</h2>
              <p>{resumeData.summary || 'Your summary will appear here...'}</p>

              <h2>Skills</h2>
              <p>{resumeData.skills ? resumeData.skills.split(',').map(s => s.trim()).join(' • ') : 'Your skills will appear here...'}</p>

              <h2>Work Experience</h2>
              {resumeData.experience.map((exp, index) => (
                <div key={index} style={{ marginBottom: '15px' }}>
                  <h3>{exp.position} {exp.company ? `at ${exp.company}` : ''}</h3>
                  <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#666' }}>
                    {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                  </p>
                  <p>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="form-section">
            <div className="form-content">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={resumeData.contactInfo.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label>Mobile</label>
                <input
                  type="tel"
                  value={resumeData.contactInfo.mobile}
                  onChange={(e) => handleContactChange('mobile', e.target.value)}
                  placeholder="+91 1234567890"
                />
              </div>

              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="url"
                  value={resumeData.contactInfo.linkedin}
                  onChange={(e) => handleContactChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div className="form-group">
                <label>Professional Summary</label>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                  placeholder="Brief summary of your professional background..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input
                  type="text"
                  value={resumeData.skills}
                  onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value })}
                  placeholder="JavaScript, React, Node.js, Python"
                />
              </div>

              <div className="experience-section">
                <h3>Work Experience</h3>
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Position</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div className="form-group">
                        <label>Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                          placeholder="Company Name"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Start Date</label>
                        <input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>End Date</label>
                        <input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                          disabled={exp.isCurrent}
                        />
                      </div>
                      <div className="form-group checkbox-wrapper">
                        <div className="checkbox-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={exp.isCurrent}
                              onChange={(e) => handleExperienceChange(index, 'isCurrent', e.target.checked)}
                            />
                            I currently work here
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                        placeholder="Describe your responsibilities and achievements..."
                        rows="3"
                      />
                    </div>

                    {resumeData.experience.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeExperience(index)}
                      >
                        Remove Experience
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="add-btn"
                  onClick={addExperience}
                >
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span> Add Experience
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;