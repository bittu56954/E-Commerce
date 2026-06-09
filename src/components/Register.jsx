import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [portalType, setPortalType] = useState('Candidate'); 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentLocation: '',
    experienceType: 'Fresher', 
    experienceYears: '',
    technology: '',
    expectedSalary: '',
    resumeLink: '',
    companyName: '',
    designation: '',
    password: '',
    confirmPassword: ''
  });
  const [isRegistered, setIsRegistered] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Bhai, passwords match nahi ho rahe hain!");
      return;
    }
    setIsRegistered(true);
    setTimeout(() => setIsRegistered(false), 5000);
  };

  return (
    <div className="corporate-register-canvas light-mode-matrix">
      

      <div className="matrix-blur-mesh mesh-alpha"></div>
      <div className="matrix-blur-mesh mesh-beta"></div>

      <div className="register-interface-wrapper">
        
       
        <div className="register-telemetry-side">
          <div className="top-branding-block">
            <div className="register-badge-light"> INDIA PLACEMENT PVT LTD</div>
            <h1 className="register-title-light">Bridge To Your <br /><span>Dream Corporate Career</span></h1>
            <p className="register-desc-light">
              India's premier placement matrix connecting elite tech professionals with global fortune 500 enterprises and high-growth tech startups.
            </p>
          </div>

          <div className="live-placement-stats-grid">
            <div className="stat-pill">
              <span className="stat-num">500+</span>
              <span className="stat-label">Hiring Partners</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">12.4K+</span>
              <span className="stat-label">Placed Packages</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">44 LPA</span>
              <span className="stat-label">Highest Package</span>
            </div>
          </div>

        
          <div className="feature-perks-stack-light">
            <div className="perk-item-light">
              <span className="perk-icon-light">⚡</span>
              <div className="perk-meta-light">
                <strong>Instant ATS Vetting Engine</strong>
                <p>Your profile directly bypasses traditional HR queues into executive standard pipelines.</p>
              </div>
            </div>
            <div className="perk-item-light">
              <span className="perk-icon-light">🛡️</span>
              <div className="perk-meta-light">
                <strong>Verified Corporate Portals</strong>
                <p>Direct contact architecture without any third-party consultancy layers.</p>
              </div>
            </div>
          </div>

        
          <div className="live-bulletin-timeline">
            <div className="bulletin-header">
              <span className="live-dot"></span> LIVE ACQUISITION FEED
            </div>
            <div className="bulletin-item">
              <strong>Chintu Kumar</strong> (MERN Stack) selected at India Placement PVT. LTD. • <span className="highlight-ctc">12 LPA</span>
            </div>
            <div className="bulletin-item">
              <strong>Ajeet Kumar</strong> (Java Developer) selected at India Placement PVT. LTD. • <span className="highlight-ctc">18.5 LPA</span>
            </div>
          </div>

       
          <div className="trusted-by-mini-banner">
            <p>TRUSTED BY LEADERS WORLDWIDE</p>
            <div className="mini-logo-track">
              <span>● Google Cloud</span>
              <span>● Meta Labs</span>
              <span>● Amazon AWS</span>
              <span>● Microsoft</span>
            </div>
          </div>
        </div>

  
        <div className="register-clean-card-node">
          {isRegistered ? (
            <div className="register-success-screen-light">
              <div className="success-pulse-ring-light">✓</div>
              <h2>Registration Initialized!</h2>
              <p>"Congratulations!"  Your profile data and placement request have been successfully routed to our core database. Our recruitment head will review your technology stack shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="corporate-register-form">
              <div className="register-form-header-light">
                <h2>Create Your GatePass Account</h2>
                <p>Select your node to start deploying credentials into our database matrix.</p>
              </div>

              {/* DYNAMIC PORTAL TABS */}
              <div className="register-portal-tabs-light">
                <button 
                  type="button" 
                  className={`reg-tab-btn-light ${portalType === 'Candidate' ? 'active-reg-tab-light' : ''}`}
                  onClick={() => setPortalType('Candidate')}
                >
                  🎓 Candidate / Job Seeker
                </button>
                <button 
                  type="button" 
                  className={`reg-tab-btn-light ${portalType === 'Recruiter' ? 'active-reg-tab-light' : ''}`}
                  onClick={() => setPortalType('Recruiter')}
                >
                  💼 Corporate Recruiter
                </button>
              </div>

        
              <div className="reg-fluid-row">
                <div className="reg-field-block-light">
                  <label>Full Name</label>
                  <input type="text" name="name" placeholder="e.g., Bittu Kumar" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="reg-field-block-light">
                  <label>Email Address</label>
                  <input type="email" name="email" placeholder="name@domain.com" value={formData.email} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="reg-fluid-row">
                <div className="reg-field-block-light">
                  <label>Mobile Number</label>
                  <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div className="reg-field-block-light">
                  <label>Current Location</label>
                  <input type="text" name="currentLocation" placeholder="e.g., Bengaluru, Noida" value={formData.currentLocation} onChange={handleInputChange} required />
                </div>
              </div>

            
              {portalType === 'Candidate' && (
                <div className="dynamic-registration-fields light-fade-in">
                  <div className="reg-fluid-row">
                    <div className="reg-field-block-light">
                      <label>Experience Tier</label>
                      <select name="experienceType" value={formData.experienceType} onChange={handleInputChange}>
                        <option value="Fresher">🎓 Fresher Candidate</option>
                        <option value="Experienced">⚡ Experienced Professional</option>
                      </select>
                    </div>

                    {formData.experienceType === 'Experienced' && (
                      <div className="reg-field-block-light light-fade-in">
                        <label>Experience Duration</label>
                        <input type="text" name="experienceYears" placeholder="e.g., 2.5 Years" value={formData.experienceYears} onChange={handleInputChange} required />
                      </div>
                    )}
                  </div>

                  <div className="reg-fluid-row">
                    <div className="reg-field-block-light">
                      <label>Core Technology / Role</label>
                      <input type="text" name="technology" placeholder="e.g., React JS Developer" value={formData.technology} onChange={handleInputChange} required />
                    </div>
                    <div className="reg-field-block-light">
                      <label>Expected Salary (Per Annum)</label>
                      <input type="text" name="expectedSalary" placeholder="e.g., 8 LPA" value={formData.expectedSalary} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="reg-field-block-light">
                    <label>Resume Cloud Link</label>
                    <input type="url" name="resumeLink" placeholder="https://drive.google.com/file/d/..." value={formData.resumeLink} onChange={handleInputChange} required />
                  </div>
                </div>
              )}

              {portalType === 'Recruiter' && (
                <div className="dynamic-registration-fields light-fade-in">
                  <div className="reg-fluid-row">
                    <div className="reg-field-block-light">
                      <label>Company Identity</label>
                      <input type="text" name="companyName" placeholder="e.g., Microsoft India" value={formData.companyName} onChange={handleInputChange} required />
                    </div>
                    <div className="reg-field-block-light">
                      <label>Corporate Designation</label>
                      <input type="text" name="designation" placeholder="e.g., Talent Acquisition Head" value={formData.designation} onChange={handleInputChange} required />
                    </div>
                  </div>
                </div>
              )}

            
              <div className="reg-fluid-row">
                <div className="reg-field-block-light">
                  <label>Choose Password</label>
                  <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
                </div>
                <div className="reg-field-block-light">
                  <label>Confirm Password</label>
                  <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} required />
                </div>
              </div>

              <button type="submit" className="corporate-register-submit-btn-light">
                <span>Create Verified Account ⚡</span>
              </button>

             
              <div className="register-footer-redirect-light">
                <p>Already registered in the grid? <Link to="/login" className="login-gateway-link-light">Login to Dashboard Hub</Link></p>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Register;