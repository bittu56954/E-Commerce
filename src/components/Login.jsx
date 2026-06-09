import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [portalType, setPortalType] = useState('Candidate'); 
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setIsLoggedIn(true);
    setTimeout(() => setIsLoggedIn(false), 4000);
  };

  return (
    <div className="corporate-login-canvas light-mode-matrix">
      
      
      <div className="matrix-blur-mesh mesh-alpha-login"></div>
      <div className="matrix-blur-mesh mesh-beta-login"></div>

      <div className="login-interface-wrapper">
        
        
        <div className="login-telemetry-side">
          <div className="top-branding-block">
            <div className="login-badge-light">🛡️ SECURE ENTERPRISE GATEWAY</div>
            <h1 className="login-title-light">Welcome Back To <br /><span>Your Placement Node</span></h1>
            <p className="login-desc-light">
              Access your centralized placement matrix dashboard. Manage corporate interviews, trace dynamic job applications, and configure hiring funnels.
            </p>
          </div>

         
          <div className="platform-security-perks">
            <div className="security-item">
              <span className="security-icon">🔒</span>
              <div className="security-meta">
                <strong>End-to-End Cryptographic Handshake</strong>
                <p>Your session logs are securely protected under military-grade corporate authentication protocols.</p>
              </div>
            </div>
            <div className="security-item">
              <span className="security-icon">📊</span>
              <div className="security-meta">
                <strong>Real-Time Analytics Vetting</strong>
                <p>Instantly tracks response matrix and changes from premium fortune 500 hr panels.</p>
              </div>
            </div>
          </div>

         
          <div className="live-uptime-banner">
            <div className="uptime-header">
              <span className="active-pulse-dot"></span> GATEWAY STATUS: OPTIMAL
            </div>
            <p className="uptime-desc">
              All cloud databases synchronized. Direct pipeline routing for <strong>500+ active recruiters</strong> is online.
            </p>
          </div>

        
          <div className="login-trusted-footer">
            <p>POWERING PLACEMENTS GLOBALLY</p>
            <div className="footer-logo-track">
              <span>● Google Cloud</span>
              <span>● Meta</span>
              <span>● AWS</span>
              <span>● Microsoft</span>
            </div>
          </div>
        </div>

       
        <div className="login-clean-card-node">
          <form onSubmit={handleSubmit} className="corporate-login-form">
            <div className="login-form-header-light">
              <h2>Account Authorization</h2>
              <p>Deploy your verified matrix credentials to access your dashboard node.</p>
            </div>

           
            <div className="login-portal-tabs-light">
              <button 
                type="button" 
                className={`login-tab-btn ${portalType === 'Candidate' ? 'active-login-tab' : ''}`}
                onClick={() => setPortalType('Candidate')}
              >
                🎓 Candidate Login
              </button>
              <button 
                type="button" 
                className={`login-tab-btn ${portalType === 'Recruiter' ? 'active-login-tab' : ''}`}
                onClick={() => setPortalType('Recruiter')}
              >
                💼 Corporate Recruiter
              </button>
            </div>

           
            <div className="login-field-block-light">
              <label>Registered Email Address</label>
              <input 
                type="email" 
                name="email" 
                placeholder="name@domain.com" 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
            </div>

            <div className="login-field-block-light">
              <label>Access Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleInputChange}
                required 
              />
            </div>

           
            <div className="login-utility-row">
              <label className="remember-me-checkbox">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <span>Remember this device</span>
              </label>
              <a href="/forgot-password" className="forgot-password-link">Forgot Password?</a>
            </div>

           
            <button type="submit" className="corporate-login-submit-btn">
              <span>Authenticate Session ⚡</span>
            </button>

           
            <div className="login-footer-redirect">
              <p>New to the placement matrix? <NavLink href="/register" className="register-gateway-link">Register an Account Node</NavLink></p>
            </div>
          </form>
          
          {isLoggedIn && (
            <div className="login-toast-success">
              🔐 Session Synchronized. Redirecting to core panel...
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;