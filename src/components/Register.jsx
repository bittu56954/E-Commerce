import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import { triggerToast } from './Toast';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentLocation: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    currentLocation: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

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

  const validatePhone = (phone) => {
    // Basic phone shape: at least 10 digits
    const re = /^\+?[0-9]{10,14}$/;
    return re.test(phone.replace(/\s+/g, ''));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validations
    if (name === 'name') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, name: 'Full name is required.' }));
      } else if (value.trim().length < 3) {
        setErrors(prev => ({ ...prev, name: 'Name must be at least 3 characters.' }));
      } else {
        setErrors(prev => ({ ...prev, name: '' }));
      }
    }

    if (name === 'email') {
      if (!value) {
        setErrors(prev => ({ ...prev, email: 'Email address is required.' }));
      } else if (!validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: 'Please specify a valid email address (e.g. name@domain.com).' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }

    if (name === 'phone') {
      if (!value) {
        setErrors(prev => ({ ...prev, phone: 'Mobile phone number is required.' }));
      } else if (!validatePhone(value)) {
        setErrors(prev => ({ ...prev, phone: 'Please specify a valid mobile number (10-14 digits).' }));
      } else {
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    }

    if (name === 'currentLocation') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, currentLocation: 'Delivery location / city is required.' }));
      } else {
        setErrors(prev => ({ ...prev, currentLocation: '' }));
      }
    }

    if (name === 'password') {
      if (!value) {
        setErrors(prev => ({ ...prev, password: 'Password is required.' }));
      } else if (value.length < 6) {
        setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters long.' }));
      } else {
        setErrors(prev => ({ ...prev, password: '' }));
        // Trigger confirmPassword revalidation if matching is broken
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
        } else if (formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
      }
    }

    if (name === 'confirmPassword') {
      if (!value) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Confirm password is required.' }));
      } else if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final verification check
    if (!formData.name || !formData.email || !formData.phone || !formData.currentLocation || !formData.password) {
      triggerToast('Please fill out all required details.', 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      triggerToast("Passwords do not match. Please verify.", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          currentLocation: formData.currentLocation,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        triggerToast(data.error || 'Registration failed.', 'error');
        setLoading(false);
        return;
      }

      if (data.requiresVerification) {
        setTempToken(data.tempToken);
        setRequiresVerification(true);
        setResendTimer(60);
        triggerToast(data.message || 'OTP sent to email and mobile.', 'info');
      }
      setLoading(false);

    } catch (error) {
      console.error('Registration error:', error);
      triggerToast('Server link error. Please check your backend state.', 'error');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpEmail || !otpPhone) {
      triggerToast('Please enter both OTP codes.', 'warning');
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-registration-otp', {
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

      // Notify navbar of session update
      window.dispatchEvent(new Event('authChange'));
      triggerToast('Account created & verified! Welcome to zomato 🎉', 'success');

      setFormData({
        name: '',
        email: '',
        phone: '',
        currentLocation: '',
        password: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        setVerifying(false);
        navigate('/'); // Go directly to storefront menu!
      }, 1500);

    } catch (error) {
      console.error('Verify registration OTP error:', error);
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
        triggerToast('New OTP codes have been dispatched.', 'success');
      } else {
        triggerToast(data.error || 'Failed to resend OTPs.', 'error');
      }
    } catch (err) {
      triggerToast('Connection error during resend.', 'error');
    }
  };

  // Determine if form has active errors or is incomplete
  const isFormInvalid = Object.values(errors).some(err => err !== '') ||
    !formData.name || !formData.email || !formData.phone ||
    !formData.currentLocation || !formData.password || !formData.confirmPassword;

  return (
    <div className="corporate-register-canvas">
      <AnimatedBackground page="register" />

      <div className="matrix-blur-mesh mesh-alpha"></div>
      <div className="matrix-blur-mesh mesh-beta"></div>

      <div className="register-interface-wrapper">

        {/* Telemetry info pane */}
        <div className="register-telemetry-side">
          <div className="top-branding-block">
            <div className="register-badge-light">🔴 ZOMATO</div>
            <h1 className="register-title-light">Create Your Profile <br /><span>Fresh Food Delivered</span></h1>
            <p className="register-desc-light">
              Register as a verified customer. Save your delivery coordinates, earn custom discount coupon vouchers, and start placing express orders online.
            </p>
          </div>

          <div className="live-placement-stats-grid">
            <div className="stat-pill">
              <span className="stat-num">30 Min</span>
              <span className="stat-label">Express Delivery</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">5 Star</span>
              <span className="stat-label">Gourmet Quality</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">100%</span>
              <span className="stat-label">Fresh Sourdough</span>
            </div>
          </div>

          <div className="feature-perks-stack-light">
            <div className="perk-item-light">
              <span className="perk-icon-light">🍕</span>
              <div className="perk-meta-light">
                <strong>Artisanal Pizza baking</strong>
                <p>All pizzas are hand-stretched and baked in wood-fired ovens.</p>
              </div>
            </div>
            <div className="perk-item-light">
              <span className="perk-icon-light">⚡</span>
              <div className="perk-meta-light">
                <strong>Instant Kitchen Tracker</strong>
                <p>Verify preparation updates in real-time from your customer dashboard.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Glassmorphic Form Card */}
        <div className="register-clean-card-node">
          {!requiresVerification ? (
            <form onSubmit={handleSubmit} className="corporate-register-form" noValidate>
              <div className="register-form-header-light">
                <h2>Join Our Shop</h2>
                <p>Register below to immediately start ordering delicious recipes.</p>
              </div>

              <div className="reg-fluid-row">
                {/* Full Name */}
                <div className="reg-field-block-light">
                  <label>Full Name</label>
                  <div className={`input-with-icon ${errors.name ? 'field-input-invalid' : ''}`}>
                    <span className="input-icon-inside">👤</span>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      autoComplete="name"
                      autoFocus
                      required
                    />
                  </div>
                  {errors.name && <span className="auth-field-error">⚠️ {errors.name}</span>}
                </div>

                {/* Email Address */}
                <div className="reg-field-block-light">
                  <label>Email Address</label>
                  <div className={`input-with-icon ${errors.email ? 'field-input-invalid' : ''}`}>
                    <span className="input-icon-inside">📧</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter Your Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      autoComplete="email"
                      required
                    />
                  </div>
                  {errors.email && <span className="auth-field-error">⚠️ {errors.email}</span>}
                </div>
              </div>

              <div className="reg-fluid-row">
                {/* Phone */}
                <div className="reg-field-block-light">
                  <label>Phone Number</label>
                  <div className={`input-with-icon ${errors.phone ? 'field-input-invalid' : ''}`}>
                    <span className="input-icon-inside">📞</span>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      autoComplete="tel"
                      required
                    />
                  </div>
                  {errors.phone && <span className="auth-field-error">⚠️ {errors.phone}</span>}
                </div>

                {/* Location */}
                <div className="reg-field-block-light">
                  <label>Default Location / City</label>
                  <div className={`input-with-icon ${errors.currentLocation ? 'field-input-invalid' : ''}`}>
                    <span className="input-icon-inside">📍</span>
                    <input
                      type="text"
                      name="currentLocation"
                      placeholder="Your Current Location"
                      value={formData.currentLocation}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {errors.currentLocation && <span className="auth-field-error">⚠️ {errors.currentLocation}</span>}
                </div>
              </div>

              <div className="reg-fluid-row">
                {/* Password */}
                <div className="reg-field-block-light">
                  <label>Password Keys</label>
                  <div className={`input-with-icon ${errors.password ? 'field-input-invalid' : ''}`}>
                    <span className="input-icon-inside">🔑</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      autoComplete="new-password"
                      required
                    />
                    <button type="button" className="password-toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? '👁' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.password && <span className="auth-field-error">⚠️ {errors.password}</span>}
                </div>

                {/* Confirm Password */}
                <div className="reg-field-block-light">
                  <label>Confirm Password</label>
                  <div className={`input-with-icon ${errors.confirmPassword ? 'field-input-invalid' : ''}`}>
                    <span className="input-icon-inside">🔑</span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      autoComplete="new-password"
                      required
                    />
                    <button type="button" className="password-toggle-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? '👁' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="auth-field-error">⚠️ {errors.confirmPassword}</span>}
                </div>
              </div>

              <button
                type="submit"
                className={`corporate-register-submit-btn-light ${isFormInvalid ? 'auth-btn-disabled' : ''}`}
                disabled={loading || isFormInvalid}
              >
                <span>{loading ? 'Registering Account...' : 'Initialize Customer Account ⚡'}</span>
              </button>

              <div className="register-footer-redirect-light">
                <p>Already registered in our database? <Link to="/login" className="login-gateway-link-light">Login here</Link></p>
              </div>
            </form>
          ) : (
            /* OTP VERIFICATION VIEW */
            <form onSubmit={handleVerifyOtp} className="corporate-register-form">
              <div className="register-form-header-light">
                <h2>Security Gateway</h2>
                <p>We've sent one-time authorization codes to your registered email and mobile number.</p>
              </div>



              {/* Email OTP */}
              <div className="reg-field-block-light">
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
              <div className="reg-field-block-light">
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

              <div className="login-utility-row" style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="otp-countdown-label" style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Code expires in: <strong style={{ color: '#e23744' }}>5 mins</strong>
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
                className="corporate-register-submit-btn-light"
                disabled={verifying}
                style={{ marginTop: '20px' }}
              >
                <span>{verifying ? 'Verifying Codes...' : 'Verify & Activate 🔓'}</span>
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
                Back to Registration
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Register;