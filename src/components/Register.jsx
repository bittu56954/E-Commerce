import React, { useState } from 'react';
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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
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
        setErrors(prev => ({ ...prev, email: 'Please specify a valid email address.' }));
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

  const isFormValid = () => {
    return (
      formData.name.trim().length >= 3 &&
      validateEmail(formData.email) &&
      validatePhone(formData.phone) &&
      formData.currentLocation.trim() !== '' &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      !errors.name &&
      !errors.email &&
      !errors.phone &&
      !errors.currentLocation &&
      !errors.password &&
      !errors.confirmPassword
    );
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isFormValid()) {
      triggerToast('Please fill out all fields correctly.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        triggerToast(data.error || 'Registration failed.', 'error');
        setLoading(false);
        return;
      }

      // Save session credentials
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('csrfToken', data.csrfToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Trigger custom authChange event
      window.dispatchEvent(new Event('authChange'));
      triggerToast('Registration successful! Welcome to zomato 🎉', 'success');

      setTimeout(() => {
        setLoading(false);
        navigate('/'); // Go directly to storefront menu!
      }, 1500);

    } catch (error) {
      console.error('Final registration error:', error);
      triggerToast('Server link error. Please check your backend state.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="corporate-register-canvas">
      <AnimatedBackground page="register" />

      <div className="matrix-blur-mesh mesh-alpha"></div>
      <div className="matrix-blur-mesh mesh-beta"></div>

      <div className="register-interface-wrapper">
        {/* Left Telemetry Panel */}
        <div className="register-telemetry-side">
          <div className="top-branding-block">
            <div className="register-badge-light">🔴 LIKE YOUR FOOD</div>
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

        {/* Right Glassmorphic Form Card */}
        <div className="register-clean-card-node">
          <form onSubmit={handleFinalSubmit} className="corporate-register-form" noValidate>
            <div className="register-form-header-light">
              <h2>Sign Up Profile</h2>
              <p>Provide your credentials below to create a direct account.</p>
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
                    placeholder="Your Location Coordinates"
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
                    required
                  />
                  <button type="button" className="password-toggle-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? '👁' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && <span className="auth-field-error">⚠️ {errors.confirmPassword}</span>}
              </div>
            </div>

            {/* Submission button */}
            <button
              type="submit"
              className={`corporate-register-submit-btn-light ${loading || !isFormValid() ? 'auth-btn-disabled' : ''}`}
              disabled={loading || !isFormValid()}
              style={{ width: '100%', marginTop: '20px' }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration ⚡'}
            </button>

            <div className="register-footer-redirect-light" style={{ marginTop: '20px' }}>
              <p>Already registered in our database? <Link to="/login" className="login-gateway-link-light">Login here</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;