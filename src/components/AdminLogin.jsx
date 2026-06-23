import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import { triggerToast } from './Toast';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Cloudflare Turnstile Mock State
  const [turnstileState, setTurnstileState] = useState('verifying'); // verifying, success

  useEffect(() => {
    // Simulate Cloudflare browser verification
    const timer = setTimeout(() => {
      setTurnstileState('success');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      triggerToast('Please fill out all required credentials.', 'warning');
      return;
    }

    if (turnstileState !== 'success') {
      triggerToast('Please wait for the browser security check to complete.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        triggerToast(data.error || 'Authentication failed.', 'error');
        setLoading(false);
        return;
      }

      if (data.requiresVerification) {
        triggerToast('Multi-factor authorization is active for this account.', 'info');
        // If the admin account has OTP active, we can handle it or redirect.
        // But for direct admin accounts, we just proceed.
      } else {
        // Direct login success
        if (!data.user.isAdmin) {
          triggerToast('Access Denied: This portal is reserved for administrators.', 'error');
          setLoading(false);
          return;
        }

        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('csrfToken', data.csrfToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Sync navbar
        window.dispatchEvent(new Event('authChange'));
        triggerToast('Welcome back, Administrator! 🔓', 'success');

        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      }
      setLoading(false);
    } catch (error) {
      console.error('Admin Login error:', error);
      triggerToast('Server link error. Please check your network.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-canvas">
      <AnimatedBackground page="login" />

      <div className="admin-blur-mesh mesh-alpha-admin-login"></div>
      <div className="admin-blur-mesh mesh-beta-admin-login"></div>

      <div className="admin-login-wrapper">
        <div className="admin-login-brand-logo">
          <div className="logo-circle-symbol">LYF</div>
        </div>

        <h1 className="admin-login-title">Admin Login</h1>
        <p className="admin-login-subtitle">Access the admin control panel</p>

        <div className="admin-login-card">
          <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
            
            {/* Email/Phone Input */}
            <div className="admin-field-block">
              <label>EMAIL OR PHONE NUMBER</label>
              <input
                type="text"
                name="email"
                placeholder="Email or 10-digit phone"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoFocus
              />
            </div>

            {/* Password Input */}
            <div className="admin-field-block">
              <div className="admin-field-label-row">
                <label>PASSWORD</label>
                <Link to="/forgot-password" className="admin-forgot-link">FORGOT?</Link>
              </div>
              <div className="admin-input-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Cloudflare Turnstile Mock */}
            <div className="cloudflare-turnstile-container">
              <div className="cloudflare-turnstile-box">
                {turnstileState === 'verifying' ? (
                  <div className="turnstile-verifying">
                    <div className="turnstile-spinner"></div>
                    <span className="turnstile-text">Verifying your browser...</span>
                  </div>
                ) : (
                  <div className="turnstile-success">
                    <div className="turnstile-check-circle">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="turnstile-check-svg">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="turnstile-success-text">Success!</span>
                  </div>
                )}
                
                <div className="cloudflare-branding">
                  <div className="cloudflare-logo-row">
                    <span className="cf-logo-cloud">☁️</span>
                    <span className="cf-logo-text">CLOUDFLARE</span>
                  </div>
                  <span className="cloudflare-subtext">Privacy • Help</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="admin-login-submit-btn"
              disabled={loading || turnstileState !== 'success'}
            >
              {loading ? 'Authenticating...' : 'Admin Login'}
            </button>

            {/* Redirect link */}
            <div className="admin-login-footer">
              <p>New admin? <Link to="/admin/register" className="admin-register-link">Register here</Link></p>
            </div>

          </form>
        </div>

        {/* Back to admin portal */}
        <div className="admin-back-portal-container">
          <Link to="/admin" className="admin-back-portal-link">
            <span>←</span> Back to Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
