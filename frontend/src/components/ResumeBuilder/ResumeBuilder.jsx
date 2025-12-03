import React, { useState, useEffect, useRef } from 'react';
import './ResumeBuilder.css';
import Navbar from '../Navbar';

const ResumeBuilder = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('form');
  const [showDashboard, setShowDashboard] = useState(false);
  const dropdownRef = useRef(null);

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

  const improveWithAI = async (text, field) => {
    // Mock AI improvement - replace with actual API call
    const improvedText = `Enhanced: ${text} (AI-improved version with better keywords and structure)`;
    
    if (field === 'summary') {
      setResumeData({
        ...resumeData,
        summary: improvedText
      });
    }
  };

  const generateMarkdown = () => {
    const skillsArray = resumeData.skills.split(',').map(s => s.trim()).filter(s => s);
    
    return `# ${user.name}

## Contact Information
- **Email:** ${resumeData.contactInfo.email}
- **Mobile:** ${resumeData.contactInfo.mobile}
- **LinkedIn:** ${resumeData.contactInfo.linkedin}

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
    // Mock PDF download - implement with backend
    alert('PDF download functionality will be implemented with backend integration');
  };

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
          </div>
        </div>

        {activeTab === 'form' && (
          <div className="form-section">
            {/* Contact Info */}
            <div className="form-card">
              <h3>Contact Information</h3>
              <div className="form-grid">
                <input
                  type="email"
                  placeholder="Email"
                  value={resumeData.contactInfo.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Mobile"
                  value={resumeData.contactInfo.mobile}
                  onChange={(e) => handleContactChange('mobile', e.target.value)}
                />
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  value={resumeData.contactInfo.linkedin}
                  onChange={(e) => handleContactChange('linkedin', e.target.value)}
                />
              </div>
            </div>

            {/* Professional Summary */}
            <div className="form-card">
              <div className="card-header">
                <h3>Professional Summary</h3>
                <button 
                  className="ai-btn"
                  onClick={() => improveWithAI(resumeData.summary, 'summary')}
                >
                  Improve with AI
                </button>
              </div>
              <textarea
                placeholder="Write a compelling professional summary..."
                value={resumeData.summary}
                onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}
                rows="4"
              />
            </div>

            {/* Skills */}
            <div className="form-card">
              <h3>Skills</h3>
              <input
                type="text"
                placeholder="Enter skills separated by commas"
                value={resumeData.skills}
                onChange={(e) => setResumeData({...resumeData, skills: e.target.value})}
              />
            </div>

            {/* Work Experience */}
            <div className="form-card">
              <div className="card-header">
                <h3>Work Experience</h3>
                <button className="add-btn" onClick={addExperience}>
                  Add Experience
                </button>
              </div>
              
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <div className="experience-header">
                    <h4>Experience {index + 1}</h4>
                    {resumeData.experience.length > 1 && (
                      <button 
                        className="remove-btn"
                        onClick={() => removeExperience(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="form-grid">
                    <input
                      type="text"
                      placeholder="Position"
                      value={exp.position}
                      onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    />
                    <input
                      type="date"
                      placeholder="Start Date"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                    />
                    <input
                      type="date"
                      placeholder="End Date"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      disabled={exp.isCurrent}
                    />
                  </div>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={exp.isCurrent}
                      onChange={(e) => handleExperienceChange(index, 'isCurrent', e.target.checked)}
                    />
                    Current Position
                  </label>
                  
                  <textarea
                    placeholder="Describe your responsibilities and achievements..."
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                    rows="3"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="preview-section">
            <div className="preview-header">
              <h3>Resume Preview</h3>
              <button className="download-btn" onClick={downloadPDF}>
                Download PDF
              </button>
            </div>
            <div className="markdown-preview">
              <pre>{generateMarkdown()}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;