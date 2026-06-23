import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import { triggerToast } from './Toast';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
  
  const [otpEmail, setOtpEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const validateEmail = (emailVal) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailVal);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      triggerToast('Please enter your email address.', 'warning');
      return;
    }
    if (!validateEmail(email)) {
      triggerToast('Please enter a valid email address.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (!response.ok) {
        triggerToast(data.error || 'Failed to request reset OTP.', 'error');
        setLoading(false);
        return;
      }

      setPreviewUrl(data.previewUrl || '');
      triggerToast(data.message || 'Verification OTP sent!', 'success');
      setStep(2);
      setLoading(false);
    } catch (error) {
      console.error('Request reset OTP error:', error);
      triggerToast('Network error request failed.', 'error');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpEmail || !password || !confirmPassword) {
      triggerToast('Please fill out all fields.', 'warning');
      return;
    }
    if (otpEmail.length !== 6) {
      triggerToast('OTP code must be 6 digits.', 'warning');
      return;
    }
    if (password.length < 6) {
      triggerToast('Password must be at least 6 characters long.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      triggerToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpEmail, password })
      });
      const data = await response.json();

      if (!response.ok) {
        triggerToast(data.error || 'Failed to reset password.', 'error');
        setLoading(false);
        return;
      }

      triggerToast('Password updated! Redirecting to login... 🎉', 'success');
      setTimeout(() => {
        setLoading(false);
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Reset password error:', error);
      triggerToast('Network error updating password.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="corporate-forgot-canvas">
      <AnimatedBackground page="login" />

      <div className="matrix-blur-mesh mesh-alpha-login"></div>
      <div className="matrix-blur-mesh mesh-beta-login"></div>

      <div className="forgot-interface-wrapper">
        <div className="forgot-telemetry-side">
          <div className="register-badge-light">🔴 SECURITY PORTAL</div>
          <h1 className="forgot-title-light">Reset Your Access <br /><span>Credentials Securely</span></h1>
          <p className="forgot-desc-light">
            If you have forgotten your password keys, verify your identity via a 6-digit email OTP and update your login credentials.
          </p>
        </div>

        <div className="forgot-clean-card-node">
          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="corporate-forgot-form" noValidate>
              <div className="forgot-form-header-light">
                <h2>Forgot Password?</h2>
                <p>Enter your registered email address below to request a security reset code.</p>
              </div>

              <div className="forgot-field-block-light">
                <label>Registered Email</label>
                <div className="input-with-icon">
                  <span className="input-icon-inside">📧</span>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`corporate-forgot-submit-btn ${!email ? 'auth-btn-disabled' : ''}`}
                disabled={loading || !email}
              >
                <span>{loading ? 'Sending Code...' : 'Send Reset Code ⚡'}</span>
              </button>

              <div className="forgot-footer-redirect">
                <p>Remembered your password? <Link to="/login" className="register-gateway-link" style={{ marginLeft: '5px' }}>Sign In here</Link></p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="corporate-forgot-form" noValidate>
              <div className="forgot-form-header-light">
                <h2>Set New Password</h2>
                <p>Enter the 6-digit security code sent to {email} and choose your new password.</p>
              </div>

              {/* OTP */}
              <div className="forgot-field-block-light">
                <label>Email Reset Code (6 Digits)</label>
                <div className="input-with-icon">
                  <span className="input-icon-inside">✉️</span>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="forgot-field-block-light">
                <label>New Password</label>
                <div className="input-with-icon">
                  <span className="input-icon-inside">🔑</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="password-toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '👁' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="forgot-field-block-light">
                <label>Confirm New Password</label>
                <div className="input-with-icon">
                  <span className="input-icon-inside">🔑</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="password-toggle-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? '👁' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {previewUrl && (
                <div className="ethereal-preview-box" style={{ background: 'rgba(255, 63, 86, 0.08)', border: '1px dashed var(--primary-color)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '12px', textAlign: 'center' }}>
                  💡 Sandbox Mode: <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>View sent OTP Email online</a>
                </div>
              )}

              <button
                type="submit"
                className={`corporate-forgot-submit-btn ${(!otpEmail || !password || !confirmPassword) ? 'auth-btn-disabled' : ''}`}
                disabled={loading || !otpEmail || !password || !confirmPassword}
              >
                <span>{loading ? 'Resetting Password...' : 'Reset & Save Password 🔓'}</span>
              </button>

              <button
                type="button"
                className="back-to-auth-btn"
                onClick={() => setStep(1)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid var(--border-color-override)',
                  color: 'var(--text-muted-override)',
                  padding: '12px',
                  borderRadius: '12px',
                  marginTop: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14.5px',
                  fontFamily: 'var(--font-title)'
                }}
              >
                Back to Email Entry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
