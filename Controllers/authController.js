import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../Models/User.js';
import AuditLogModel from '../Models/AuditLog.js';
import { sendEmailOTP, sendSmsOTP } from '../Services/otpService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'zomato_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'zomato_refresh_secret_key_2026';

// Helper to generate 6-digit OTP code
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Log OTP code inside a prominent visual console banner for the admin/user to view in sandbox mode
const logOTPsToConsole = (email, emailOtp, phoneOtp) => {
  console.log('====================================================');
  console.log(`🔑 SECURITY GATEWAY: OTP Verification Issued`);
  console.log(`📧 Recipient: ${email}`);
  console.log(`✉️ EMAIL OTP:   [ ${emailOtp} ]`);
  console.log(`📱 MOBILE OTP:  [ ${phoneOtp} ]`);
  console.log(`⏳ Valid for:   5 Minutes`);
  console.log('====================================================');
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, currentLocation, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ error: 'Please provide name, email, phone, and password.' });
    }

    // Check if user already exists with email
    const existingEmailUser = await UserModel.findOne({ email });
    if (existingEmailUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Check if user already exists with phone
    const existingPhoneUser = await UserModel.findOne({ phone });
    if (existingPhoneUser) {
      return res.status(400).json({ error: 'Mobile number already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailOtp = generateOTP();
    const phoneOtp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    const userData = {
      name,
      email,
      phone,
      currentLocation: currentLocation || '',
      password: hashedPassword,
      isAdmin: false,
      isVerified: false,
      otpEmailCode: emailOtp,
      otpPhoneCode: phoneOtp,
      otpExpires,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      refreshTokens: []
    };

    const newUser = await UserModel.create(userData);

    // Log OTPs for registry and dispatch via email/SMS services
    logOTPsToConsole(email, emailOtp, phoneOtp);
    await sendEmailOTP(email, emailOtp);
    await sendSmsOTP(phone, phoneOtp);
    await AuditLogModel.log('USER_REGISTER_PENDING', email, ip, 'Registration details submitted. Awaiting dual-OTP verification.');

    // Generate a temporary verification token
    const tempToken = jwt.sign(
      { email, purpose: 'registration_verify' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(201).json({
      message: 'Registration details registered. Please verify email and phone OTPs to activate profile.',
      requiresVerification: true,
      email,
      tempToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both your email and password.' });
    }

    let user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials. Account not found.' });
    }

    // Check Account Lockout status
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const remaining = Math.round((new Date(user.lockoutUntil) - new Date()) / 1000 / 60);
      await AuditLogModel.log('LOGIN_ATTEMPT_LOCKED', email, ip, 'Attempt to login to a locked account.');
      return res.status(403).json({ error: `Account is temporarily locked. Please try again in ${remaining} minute(s).` });
    }

    // Verify password (allow plain check for admin credentials or standard bcrypt verification)
    let isPasswordValid = false;
    if (email === 'admin@zomato.com' && password === 'admin123') {
      isPasswordValid = true;
    } else {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!isPasswordValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const update = { failedLoginAttempts: attempts };
      
      if (attempts >= 5) {
        update.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        update.failedLoginAttempts = 0; // reset counter
        await AuditLogModel.log('ACCOUNT_LOCKOUT', email, ip, 'Account locked for 15 minutes due to 5 consecutive password failures.');
        await UserModel.findByIdAndUpdate(user.id, update);
        return res.status(403).json({ error: 'Account has been locked for 15 minutes due to 5 failed attempts.' });
      }

      await UserModel.findByIdAndUpdate(user.id, update);
      await AuditLogModel.log('USER_LOGIN_FAILED', email, ip, `Failed password attempt ${attempts}/5.`);
      return res.status(400).json({ error: `Invalid access credentials. Wrong password! Attempt ${attempts}/5.` });
    }

    // Generate new OTP codes for both User and Admin
    const emailOtp = generateOTP();
    const phoneOtp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Save details to DB
    await UserModel.findByIdAndUpdate(user.id, {
      otpEmailCode: emailOtp,
      otpPhoneCode: phoneOtp,
      otpExpires,
      failedLoginAttempts: 0,
      lockoutUntil: null
    });

    // Log OTPs to console and dispatch via email/SMS services
    logOTPsToConsole(email, emailOtp, phoneOtp);
    await sendEmailOTP(email, emailOtp);
    await sendSmsOTP(user.phone, phoneOtp);
    await AuditLogModel.log('USER_LOGIN_PENDING', email, ip, 'Credentials verified. OTP codes issued.');

    // Generate temporary validation token
    const tempToken = jwt.sign(
      { email, purpose: 'login_verify' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({
      message: 'Credentials authenticated. Dual OTP codes have been sent to your registered terminals.',
      requiresVerification: true,
      email,
      tempToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// Verify Registration OTP
export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otpEmail, otpPhone, tempToken } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email || !otpEmail || !otpPhone || !tempToken) {
      return res.status(400).json({ error: 'Verification data is missing.' });
    }

    // Decode and check token validity
    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
      if (decoded.purpose !== 'registration_verify' || decoded.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(403).json({ error: 'Verification session expired or invalid.' });
      }
    } catch (e) {
      return res.status(403).json({ error: 'Verification session has expired.' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User record not found.' });
    }

    // Check OTP Match and expiration
    const now = new Date();
    if (!user.otpEmailCode || !user.otpPhoneCode) {
      return res.status(400).json({ error: 'No verification request is active for this account.' });
    }

    if (!user.otpExpires || now > new Date(user.otpExpires)) {
      return res.status(400).json({ error: 'OTP codes have expired. Please request a new pair.' });
    }

    if (user.otpEmailCode !== otpEmail || user.otpPhoneCode !== otpPhone) {
      return res.status(400).json({ error: 'Incorrect Email OTP or Mobile OTP code values.' });
    }

    // Update User verified status
    const update = {
      isVerified: true,
      otpEmailCode: null,
      otpPhoneCode: null,
      otpExpires: null
    };

    // Generate Final JWT session keys
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, isAdmin: false },
      JWT_SECRET,
      { expiresIn: '15m' } // Short access token lifetime
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' } // Longer refresh token lifetime
    );

    update.refreshTokens = [refreshToken];
    const updatedUser = await UserModel.findByIdAndUpdate(user.id, update);

    // Save refresh token to HTTPOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Generate CSRF token for double-submit check
    const csrfToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
    res.cookie('csrf-token', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    await AuditLogModel.log('USER_REGISTER_SUCCESS', email, ip, 'Account email/phone verified and activated.');

    const userResponse = { ...updatedUser };
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.status(200).json({
      message: 'Account verified successfully! Session established.',
      accessToken,
      csrfToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Verify registration OTP error:', error);
    res.status(500).json({ error: 'Verification failed.' });
  }
};

// Verify Login OTP
export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otpEmail, otpPhone, tempToken } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email || !otpEmail || !otpPhone || !tempToken) {
      return res.status(400).json({ error: 'Verification inputs are missing.' });
    }

    // Decode and check token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
      if (decoded.purpose !== 'login_verify' || decoded.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(403).json({ error: 'Invalid or expired verification session.' });
      }
    } catch (e) {
      return res.status(403).json({ error: 'Verification session has expired.' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    // Verify OTP codes values
    const now = new Date();
    if (!user.otpEmailCode || !user.otpPhoneCode) {
      return res.status(400).json({ error: 'No verification request is active for this account.' });
    }

    if (!user.otpExpires || now > new Date(user.otpExpires)) {
      return res.status(400).json({ error: 'OTP codes have expired. Please request a new pair.' });
    }

    if (user.otpEmailCode !== otpEmail || user.otpPhoneCode !== otpPhone) {
      return res.status(400).json({ error: 'Incorrect Email OTP or Mobile OTP code values.' });
    }

    // Session authorization setup
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin || false },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh tokens list in DB
    const refreshTokens = user.refreshTokens || [];
    refreshTokens.push(refreshToken);
    await UserModel.findByIdAndUpdate(user.id, {
      otpEmailCode: null,
      otpPhoneCode: null,
      otpExpires: null,
      refreshTokens
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const csrfToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
    res.cookie('csrf-token', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    await AuditLogModel.log('USER_LOGIN_SUCCESS', email, ip, 'User verified OTP and logged in successfully.');

    const userResponse = { ...user };
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.status(200).json({
      message: 'Session authorized successfully!',
      accessToken,
      csrfToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Verify login OTP error:', error);
    res.status(500).json({ error: 'Verification failed.' });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is missing.' });
    }

    const emailOtp = generateOTP();
    const phoneOtp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    await UserModel.findByIdAndUpdate(user.id, {
      otpEmailCode: emailOtp,
      otpPhoneCode: phoneOtp,
      otpExpires
    });

    logOTPsToConsole(email, emailOtp, phoneOtp);
    await sendEmailOTP(email, emailOtp);
    await sendSmsOTP(user.phone, phoneOtp);
    await AuditLogModel.log('OTP_RESENT', email, ip, 'User requested new OTP pair.');

    res.status(200).json({
      message: 'New OTP codes have been sent to your registered terminals.'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP codes.' });
  }
};

// Refresh Access Token
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies ? req.cookies['refreshToken'] : null;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Access denied. Refresh token missing.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (e) {
      return res.status(403).json({ error: 'Invalid or expired refresh token.' });
    }

    if (decoded.email === 'admin@zomato.com') {
      const accessToken = jwt.sign(
        { id: 'admin', email: 'admin@zomato.com', isAdmin: true },
        JWT_SECRET,
        { expiresIn: '15m' }
      );
      return res.status(200).json({ accessToken });
    }

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ error: 'User record not found.' });
    }

    // Verify token exists in user's refreshTokens database whitelist
    const refreshTokens = user.refreshTokens || [];
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ error: 'Refresh token revoked or invalid.' });
    }

    // Issue new short-lived access token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin || false },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Profile details
export const getProfile = async (req, res) => {
  try {
    if (req.userId === 'admin') {
      return res.status(200).json({ user: { id: 'admin', name: 'Shop Manager', email: 'admin@zomato.com', isAdmin: true } });
    }

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const userResponse = { ...user };
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve session profile.' });
  }
};

// Middleware to verify JWT token
export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access Denied. Token is missing.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Malformed token.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userIsAdmin = decoded.isAdmin || false;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired session token.' });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.userIsAdmin) {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await UserModel.findByIdAndDelete(id);
    if (!success) {
      return res.status(404).json({ error: 'User record not found.' });
    }
    
    // audit log
    await AuditLogModel.log('USER_DELETED_BY_ADMIN', id, req.ip, `Account ${id} was deleted.`);
    
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await UserModel.find({});
    const users = allUsers.map(u => {
      const userRes = { ...u };
      delete userRes.password;
      delete userRes.refreshTokens;
      return userRes;
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users directory.' });
  }
};
