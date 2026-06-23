import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import { triggerToast } from './Toast';
import './AdminRegister.css';

const AdminRegister = () => {
  const navigate = useNavigate();
  
  // Steps: 1 = Verification, 2 = Admin Details, 3 = Bank Account
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');

  // Form fields state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    currentLocation: '',
    bankAccountHolder: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfscCode: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Simulate or request OTP dispatch
  const handleSendOtp = async () => {
    if (!formData.fullName || !formData.email) {
      triggerToast('Please provide your Full Name and Email before requesting an OTP.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      triggerToast('Please enter a valid email address format.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (!response.ok) {
        triggerToast(data.error || 'Failed to dispatch verification code.', 'error');
        setLoading(false);
        return;
      }

      setOtpSent(true);
      triggerToast('OTP code dispatched to your email!', 'info');

      // Sandbox helper: Fetch the generated OTP from /latest-otp so the user does not need console logs
      setTimeout(async () => {
        try {
          const otpRes = await fetch('/api/auth/latest-otp');
          if (otpRes.ok) {
            const otpData = await otpRes.json();
            if (otpData && otpData.emailOtp) {
              setSimulatedOtp(otpData.emailOtp);
              triggerToast(`[SANDBOX] Verification OTP: ${otpData.emailOtp}`, 'success');
            }
          }
        } catch (e) {
          console.warn('Sandbox OTP fetch disabled or unreachable:', e);
        }
      }, 800);

    } catch (err) {
      console.error('OTP Send error:', err);
      triggerToast('Server link error. Please check your network.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Verification "Continue" Action
  const handleStep1Continue = async () => {
    if (!formData.fullName || !formData.email) {
      triggerToast('Full Name and Email are required.', 'warning');
      return;
    }

    if (!otpSent) {
      triggerToast('Please click "Send OTP" and enter the code to verify your email.', 'warning');
      return;
    }

    if (!otpCodeInput) {
      triggerToast('Please enter the 6-digit OTP code.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/check-verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          otpEmail: otpCodeInput
        })
      });

      const data = await response.json();

      if (!response.ok) {
        triggerToast(data.error || 'Invalid OTP code. Please check and try again.', 'error');
        setLoading(false);
        return;
      }

      triggerToast('Email address verified successfully!', 'success');
      setStep(2);
    } catch (err) {
      console.error('OTP Check error:', err);
      triggerToast('Server connection error during validation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete Register Form Action
  const handleFinalRegister = async (e) => {
    if (e) e.preventDefault();

    if (!formData.phone || !formData.password || !formData.currentLocation) {
      triggerToast('Please fill out all administrative details.', 'warning');
      return;
    }

    if (formData.password.length < 6) {
      triggerToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (formData.phone.length < 10) {
      triggerToast('Please enter a valid phone number.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          currentLocation: formData.currentLocation,
          password: formData.password,
          bankAccountHolder: '',
          bankName: '',
          bankAccountNumber: '',
          bankIfscCode: ''
        })
      });

      const data = await response.json();

      if (!response.ok) {
        triggerToast(data.error || 'Failed to register administrator profile.', 'error');
        setLoading(false);
        return;
      }

      // Automatically store authorization token in session
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('csrfToken', data.csrfToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Synchronize views
      window.dispatchEvent(new Event('authChange'));
      triggerToast('Admin profile activated successfully! 🔓', 'success');

      setTimeout(() => {
        navigate('/admin');
      }, 1000);

    } catch (err) {
      console.error('Admin Register error:', err);
      triggerToast('Failed to reach authentication gateway.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-canvas">
      <AnimatedBackground page="register" />

      <div className="admin-blur-mesh mesh-alpha-admin-register"></div>
      <div className="admin-blur-mesh mesh-beta-admin-register"></div>

      <div className="admin-register-wrapper">
        <div className="admin-register-brand-logo">
          <div className="logo-circle-symbol">LYF</div>
        </div>

        <h1 className="admin-register-title">Admin Register</h1>
        <p className="admin-register-subtitle">Create your admin account</p>

        {/* Timeline Progress Bar */}
        <div className="admin-timeline-tracker" style={{ maxWidth: '320px' }}>
          <div className={`timeline-node ${step >= 1 ? 'node-active' : ''}`}>
            <div className="node-circle">1</div>
            <span className="node-label">Verification</span>
          </div>
          <div className={`timeline-connector ${step >= 2 ? 'connector-active' : ''}`}></div>
          <div className={`timeline-node ${step >= 2 ? 'node-active' : ''}`}>
            <div className="node-circle">2</div>
            <span className="node-label">Admin Details</span>
          </div>
        </div>

        {/* Wizard Form Cards */}
        <div className="admin-register-card">

          {/* STEP 1: VERIFICATION */}
          {step === 1 && (
            <div className="wizard-step-container animate-fade-in">
              <div className="admin-field-block">
                <label>FULL NAME *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  autoFocus
                />
              </div>

              <div className="admin-field-block">
                <label>EMAIL *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {otpSent && (
                <div className="admin-field-block animate-slide-down">
                  <label>ENTER 6-DIGIT OTP *</label>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter code"
                    value={otpCodeInput}
                    onChange={(e) => setOtpCodeInput(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  {simulatedOtp && (
                    <span className="sandbox-otp-hint">
                      💡 Sandbox Code: <strong>{simulatedOtp}</strong>
                    </span>
                  )}
                </div>
              )}

              <div className="register-actions-row">
                {!otpSent ? (
                  <button
                    type="button"
                    className="admin-send-otp-btn"
                    onClick={handleSendOtp}
                    disabled={loading || !formData.fullName || !formData.email}
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="admin-send-otp-btn otp-resend-variant"
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}

                <button
                  type="button"
                  className="admin-continue-btn"
                  onClick={handleStep1Continue}
                  disabled={loading || !otpCodeInput}
                >
                  Continue
                </button>
              </div>

              <div className="admin-register-footer">
                <p>Already have an account? <Link to="/admin/login" className="admin-login-link">Login here</Link></p>
              </div>
            </div>
          )}

          {/* STEP 2: ADMIN DETAILS */}
          {step === 2 && (
            <form onSubmit={handleFinalRegister} className="wizard-step-container animate-fade-in" noValidate>
              <div className="admin-field-block">
                <label>PHONE NUMBER *</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter 10-digit number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  autoFocus
                />
              </div>

              <div className="admin-field-block">
                <label>PASSWORD *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create your secure password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="admin-field-block">
                <label>CURRENT LOCATION *</label>
                <input
                  type="text"
                  name="currentLocation"
                  placeholder="E.g. Bangalore, India"
                  value={formData.currentLocation}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="register-actions-row single-btn">
                <button
                  type="submit"
                  className="admin-register-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Activating Profile...' : 'Register Admin'}
                </button>
              </div>

              <div className="wizard-back-navigation">
                <button type="button" className="wizard-back-btn" onClick={() => setStep(1)}>
                  ← Back to Step 1
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Back link */}
        <div className="admin-back-portal-container">
          <Link to="/admin" className="admin-back-portal-link">
            <span>←</span> Back to Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
