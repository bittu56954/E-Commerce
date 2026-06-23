import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import { triggerToast } from './Toast';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    let timer;
    if (requiresVerification && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [requiresVerification, resendTimer]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: val }));

    // Real-time validation
    if (name === 'email') {
      if (!val) {
        setErrors(prev => ({ ...prev, email: 'Email address is required.' }));
      } else if (!validateEmail(val)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email format (e.g. name@domain.com).' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }

    if (name === 'password') {
      if (!val) {
        setErrors(prev => ({ ...prev, password: 'Password key is required.' }));
      } else if (val.length < 6) {
        setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters long.' }));
      } else {
        setErrors(prev => ({ ...prev, password: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      triggerToast('Please fill out all required credentials.', 'warning');
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Please specify a valid email format.' }));
      triggerToast('Invalid email address format.', 'warning');
      return;
    }

    if (formData.password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters.' }));
      triggerToast('Password does not meet minimum strength.', 'warning');
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
        setTempToken(data.tempToken);
        setRequiresVerification(true);
        setResendTimer(60);
        setPreviewUrl(data.previewUrl || '');
        triggerToast(data.message || 'OTP sent to email and mobile.', 'info');
      } else {
        // Direct login success
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('csrfToken', data.csrfToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Sync navbar
        window.dispatchEvent(new Event('authChange'));
        triggerToast('Login successful! Welcome back. 🔓', 'success');

        setTimeout(() => {
          if (data.user.isAdmin) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 1000);
      }
      setLoading(false);
    } catch (error) {
      console.error('Login error:', error);
      triggerToast('Server link error. Please check your network.', 'error');
      setLoading(false);
    }
  };

  // Verify OTP submission
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpEmail || !otpPhone) {
      triggerToast('Please enter both OTP codes.', 'warning');
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          otpEmail,
          otpPhone,
          tempToken
        })
      });

      const data = await response.json();
      if (!response.ok) {
        triggerToast(data.error || 'OTP verification failed.', 'error');
        setVerifying(false);
        return;
      }

      // Save tokens and CSRF token
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('csrfToken', data.csrfToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Trigger navbar sync
      window.dispatchEvent(new Event('authChange'));
      triggerToast('Identity verified! Session established successfully. 🔓', 'success');

      setTimeout(() => {
        setVerifying(false);
        if (data.user.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 1000);

    } catch (error) {
      console.error('Verify OTP error:', error);
      triggerToast('Network link error during verification.', 'error');
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      if (response.ok) {
        setResendTimer(60);
        setPreviewUrl(data.previewUrl || '');
        triggerToast('New OTP codes have been dispatched.', 'success');
      } else {
        triggerToast(data.error || 'Failed to resend OTPs.', 'error');
      }
    } catch (err) {
      triggerToast('Connection error during resend.', 'error');
    }
  };

  const isFormInvalid = Object.values(errors).some(err => err !== '') || !formData.email || !formData.password;

  return (
    <div className="corporate-login-canvas">
      <AnimatedBackground page="login" />

      <div className="matrix-blur-mesh mesh-alpha-login"></div>
      <div className="matrix-blur-mesh mesh-beta-login"></div>

      <div className="login-interface-wrapper">

        {/* Telemetry info panel */}
        <div className="login-telemetry-side">
          <div className="top-branding-block">
            <div className="login-badge-light">🔒 SECURE ENCRYPTED GATEWAY</div>
            <h1 className="login-title-light">Welcome Back to <br /><span style={{ textTransform: 'lowercase' }}>Like Your Food</span></h1>
            <p className="login-desc-light">
              Access your storefront profile. Admin status changes, orders, and tickets are audited to maintain system security.
            </p>
          </div>

          <div className="platform-security-perks">
            <div className="security-item">
              <span className="security-icon">🛡️</span>
              <div className="security-meta">
                <strong>Two-Factor OTP Check</strong>
                <p>Ensures that registration and logins pass double confirmation validation.</p>
              </div>
            </div>
            <div className="security-item">
              <span className="security-icon">🔒</span>
              <div className="security-meta">
                <strong>Anti-Brute Force lock</strong>
                <p>Failed login attempts trigger automated 15-minute lockouts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Glassmorphic Form / Verification Card */}
        <div className="login-clean-card-node">
          {!requiresVerification ? (
            <form onSubmit={handleSubmit} className="corporate-login-form" noValidate>
              <div className="login-form-header-light">
                <h2>Sign In</h2>
                <p>Enter your authorization email and password keys to proceed.</p>
              </div>

              {/* Email input block */}
              <div className="login-field-block-light">
                <label>Registered Email Address</label>
                <div className={`input-with-icon ${errors.email ? 'field-input-invalid' : ''}`}>
                  <span className="input-icon-inside">📧</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter username"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </div>
                {errors.email && <span className="auth-field-error">⚠️ {errors.email}</span>}
              </div>

              {/* Password input block */}
              <div className="login-field-block-light">
                <label>Password Keys</label>
                <div className={`input-with-icon ${errors.password ? 'field-input-invalid' : ''}`}>
                  <span className="input-icon-inside">🔑</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <span className="auth-field-error">⚠️ {errors.password}</span>}
              </div>

              <div className="login-utility-row">
                <label className="remember-me-checkbox">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <span>Keep me logged in</span>
                </label>
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className={`corporate-login-submit-btn ${isFormInvalid ? 'auth-btn-disabled' : ''}`}
                disabled={loading || isFormInvalid}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In ⚡'}</span>
              </button>

              <div className="login-footer-redirect">
                <p>New to our kitchen? <Link to="/register" className="register-gateway-link">Register an Account</Link></p>
              </div>
            </form>
          ) : (
            /* OTP VERIFICATION VIEW */
            <form onSubmit={handleVerifyOtp} className="corporate-login-form">
              <div className="login-form-header-light">
                <h2>Security Gateway</h2>
                <p>We've sent one-time authorization codes to your registered email and mobile number.</p>
              </div>



              {/* Email OTP */}
              <div className="login-field-block-light">
                <label>Email OTP Code (6 Digits)</label>
                <div className="input-with-icon">
                  <span className="input-icon-inside">✉️</span>
                  <input
                    type="text"
                    placeholder="Enter Email OTP"
                    maxLength="6"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Mobile OTP */}
              <div className="login-field-block-light">
                <label>Mobile OTP Code (6 Digits)</label>
                <div className="input-with-icon">
                  <span className="input-icon-inside">📱</span>
                  <input
                    type="text"
                    placeholder="Enter Mobile OTP"
                    maxLength="6"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <div className="login-utility-row" style={{ marginTop: '10px' }}>
                <span className="otp-countdown-label">
                  Code expires in: <strong>5 mins</strong>
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="resend-otp-btn"
                  disabled={resendTimer > 0}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: resendTimer > 0 ? 'rgba(255, 255, 255, 0.4)' : '#e23744',
                    cursor: resendTimer > 0 ? 'default' : 'pointer',
                    fontWeight: 600,
                    fontSize: '13.5px'
                  }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP Codes'}
                </button>
              </div>

              <button
                type="submit"
                className="corporate-login-submit-btn"
                disabled={verifying}
                style={{ marginTop: '15px' }}
              >
                <span>{verifying ? 'Verifying Codes...' : 'Verify & Authorize 🔓'}</span>
              </button>

              <button
                type="button"
                className="back-to-auth-btn"
                onClick={() => setRequiresVerification(false)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                  padding: '12px',
                  borderRadius: '12px',
                  marginTop: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14.5px'
                }}
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;