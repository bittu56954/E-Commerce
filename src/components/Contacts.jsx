import React, { useState } from 'react';
import './Contacts.css';

const Contacts = () => {
  const [formData, setFormData] = useState({
    portalType: 'Candidate', 
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
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000); 
  };

  return (
    <div className="corporate-contact-canvas">
      
     
      <div className="branding-blur-mesh mesh-blue"></div>
      <div className="branding-blur-mesh mesh-orange"></div>

      <div className="placement-grid-container">
        
        
        <div className="company-telemetry-side">
          <div className="corporate-badge">👔 INDIA PLACEMENT PVT LTD</div>
          <h1 className="corporate-title">Empowering India's Talent Ecosystem</h1>
          <p className="corporate-desc">
            Bridge the gap between vision and execution. Whether you are a global enterprise looking to build your offshore tech team or a candidate seeking your next breakthrough role, our secure placement pipeline is ready.
          </p>

          <div className="placement-trust-metrics">
            <div className="trust-cube">
              <h3>500+</h3>
              <p>Corporate Partners</p>
            </div>
            <div className="trust-cube">
              <h3>12,400+</h3>
              <p>Candidates Placed</p>
            </div>
            <div className="trust-cube">
              <h3>98.2%</h3>
              <p>SLA Match Rate</p>
            </div>
          </div>

         
          <div className="office-gateways-stack">
            <div className="gateway-card">
              <span className="gateway-icon">📍</span>
              <div className="gateway-info">
                <span>REGISTERED HEADQUARTERS</span>
                <strong>Tech Zone Core, Sector 62, Bengaluru, India</strong>
              </div>
            </div>

            <div className="gateway-card">
              <span className="gateway-icon">✉️</span>
              <div className="gateway-info">
                <span>CORPORATE ACQUISITIONS</span>
                <strong>hr@indiaplacement.com</strong>
              </div>
            </div>
          </div>
        </div>

        
        <div className="glass-form-container-node">
          {formSubmitted ? (
            <div className="transmission-success-card">
              <div className="success-icon-shield">✓</div>
              <h2>Application Transmitted</h2>
              <p>
               Congratulations! , Your profile data and placement request have been successfully routed to our core database. Our recruitment head will review your technology stack shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="corporate-ingress-form">
              <div className="form-title-block">
                <h2>Connect to Placement Hub</h2>
                <p>Select your operational profile to parse your details into our ATS engine.</p>
              </div>

             
              <div className="portal-selector-tabs">
                <button 
                  type="button" 
                  className={`tab-btn ${formData.portalType === 'Candidate' ? 'active-tab' : ''}`}
                  onClick={() => setFormData({ ...formData, portalType: 'Candidate' })}
                >
                  🎓 I am a Job Seeker
                </button>
                <button 
                  type="button" 
                  className={`tab-btn ${formData.portalType === 'Recruiter' ? 'active-tab' : ''}`}
                  onClick={() => setFormData({ ...formData, portalType: 'Recruiter' })}
                >
                  💼 We are Hiring
                </button>
              </div>

             
              <div className="form-fluid-row">
                <div className="form-field-block">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Enter Your Name :" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="form-field-block">
                  <label>Official Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="name@domain.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>

            
              <div className="form-fluid-row">
                <div className="form-field-block">
                  <label>Mobile (WhatsApp Enabled)</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="+91 XXXXX XXXXX" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="form-field-block">
                  <label>Current Location (City)</label>
                  <input 
                    type="text" 
                    name="currentLocation" 
                    placeholder="e.g., Bengaluru, Delhi NCR" 
                    value={formData.currentLocation}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>

             
              {formData.portalType === 'Candidate' && (
                <div className="dynamic-candidate-fields animated-fade-in">
                  
                 
                  <div className="form-fluid-row">
                    <div className="form-field-block">
                      <label>Experience Status</label>
                      <select 
                        name="experienceType" 
                        value={formData.experienceType}
                        onChange={handleInputChange}
                      >
                        <option value="Fresher">🎓 Fresher</option>
                        <option value="Experienced">⚡ Experienced Professional</option>
                      </select>
                    </div>

                    {formData.experienceType === 'Experienced' && (
                      <div className="form-field-block animated-fade-in">
                        <label>Total Experience (in Years)</label>
                        <input 
                          type="text" 
                          name="experienceYears" 
                          placeholder="e.g., 2.5 Years, 5+ Years" 
                          value={formData.experienceYears}
                          onChange={handleInputChange}
                          required={formData.experienceType === 'Experienced'}
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-fluid-row">
                    <div className="form-field-block">
                      <label>Core Technology / Role</label>
                      <input 
                        type="text" 
                        name="technology" 
                        placeholder="e.g., React Node Developer, DevOps, UI/UX" 
                        value={formData.technology}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="form-field-block">
                      <label>Expected Salary (CTC / Annum)</label>
                      <input 
                        type="text" 
                        name="expectedSalary" 
                        placeholder="e.g., 6 LPA, 12-15 LPA" 
                        value={formData.expectedSalary}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>

                  
                  <div className="form-field-block">
                    <label>Resume Link (Google Drive / LinkedIn / Dropbox)</label>
                    <input 
                      type="url" 
                      name="resumeLink" 
                      placeholder="https://drive.google.com/file/d/..." 
                      value={formData.resumeLink}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>

                </div>
              )}

              
              {formData.portalType === 'Recruiter' && (
                <div className="dynamic-recruiter-fields animated-fade-in">
                  <div className="form-field-block">
                    <label>Company / Organization Name</label>
                    <input 
                      type="text" 
                      name="companyName" 
                      placeholder="e.g., India Tech Labs Pvt Ltd" 
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
              )}

              
              <div className="form-field-block">
                <label>Additional Notes / Requirements</label>
                <textarea 
                  name="message" 
                  rows="3" 
                  placeholder="Anything else you want to share with our onboarding panel..."
                  value={formData.message}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button type="submit" className="corporate-submit-action-btn">
                <span>Submit to Placement Grid ⚡</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Contacts;