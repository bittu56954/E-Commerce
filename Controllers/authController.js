import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../Models/User.js';
import PendingUserModel from '../Models/PendingUser.js';
import AuditLogModel from '../Models/AuditLog.js';
import { sendEmailOTP, sendSmsOTP } from '../Services/otpService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'zomato_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'zomato_refresh_secret_key_2026';

// Helper to generate 6-digit OTP code
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

let latestOTPs = { email: null, emailOtp: null, phoneOtp: null };
let tempVerifyOtps = {};

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

    if (!email || !password || !name || !phone || !currentLocation) {
      return res.status(400).json({ error: 'Please provide name, email, phone, currentLocation, and password.' });
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
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    const pendingData = {
      name,
      email,
      phone,
      currentLocation,
      password: hashedPassword,
      otpEmailCode: emailOtp,
      otpExpires
    };

    // Store the registration data and OTP code temporarily
    console.log(`[DEBUG REGISTRATION] 1. Hashed password and inserting pending user to database for "${email}"...`);
    await PendingUserModel.create(pendingData);
    console.log(`[DEBUG REGISTRATION] 2. Pending user created successfully in DB.`);

    latestOTPs = { email, emailOtp, phoneOtp: null };
    logOTPsToConsole(email, emailOtp, 'N/A');
    
    console.log(`[DEBUG REGISTRATION] 3. Dispatched sendEmailOTP request...`);
    const emailResult = await sendEmailOTP(email, emailOtp, null);
    
    if (emailResult && emailResult.success) {
      console.log(`[DEBUG REGISTRATION] 4a. Email OTP sent successfully. (Ethereal Preview URL: ${emailResult.previewUrl || 'None'})`);
    } else {
      console.error(`[DEBUG REGISTRATION] 4b. Nodemailer failed to send Email OTP. Error: ${emailResult ? emailResult.error : 'Unknown error'}`);
    }

    await AuditLogModel.log('USER_REGISTER_PENDING', email, ip, 'Registration details submitted. Awaiting email OTP verification.');

    // Generate a temporary verification token
    const tempToken = jwt.sign(
      { email, purpose: 'registration_verify' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(201).json({
      message: 'Registration details submitted. Please verify email OTP to activate profile.',
      requiresVerification: true,
      email,
      tempToken,
      previewUrl: emailResult ? emailResult.previewUrl : null,
      debugSmtpError: emailResult && !emailResult.success ? emailResult.error : null
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
    if (email === 'admin@gmail.com' && password === 'admin123') {
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
      failedLoginAttempts: 0,
      lockoutUntil: null,
      refreshTokens
    });

    // Generate CSRF token for double-submit check
    const csrfToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
    res.cookie('csrf-token', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    await AuditLogModel.log('USER_LOGIN_SUCCESS', email, ip, 'Credentials verified. Direct login session established.');

    const userResponse = { ...user._doc };
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.status(200).json({
      message: 'Login successful!',
      requiresVerification: false,
      accessToken,
      csrfToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// Verify Registration OTP
export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otpEmail, tempToken } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email || !otpEmail || !tempToken) {
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

    // Find temporary registration record
    const pendingUser = await PendingUserModel.findOne({ email });
    if (!pendingUser) {
      return res.status(400).json({ error: 'No active registration request found or OTP expired.' });
    }

    // Check OTP Match and expiration
    const now = new Date();
    if (!pendingUser.otpExpires || now > new Date(pendingUser.otpExpires)) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }

    if (pendingUser.otpEmailCode !== otpEmail) {
      return res.status(400).json({ error: 'Incorrect OTP code.' });
    }

    // Only create user account after successful verification
    const newUser = await UserModel.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password, // already bcrypt hashed
      phone: pendingUser.phone,
      currentLocation: pendingUser.currentLocation,
      isVerified: true
    });

    // Delete temporary record
    await PendingUserModel.deleteOne({ email });

    // Generate Final JWT session keys
    const accessToken = jwt.sign(
      { id: newUser.id, email: newUser.email, isAdmin: false },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh tokens list in DB
    await UserModel.findByIdAndUpdate(newUser.id, {
      refreshTokens: [refreshToken]
    });

    // Save refresh token to HTTPOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Generate CSRF token for double-submit check
    const csrfToken = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '15m' });
    res.cookie('csrf-token', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    await AuditLogModel.log('USER_REGISTER_SUCCESS', email, ip, 'Account email verified and activated.');

    const userResponse = { ...newUser };
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.status(200).json({
      message: 'Account verified and created successfully! Session established.',
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

    const userResponse = { ...(user._doc || user) };
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
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    const pendingUser = await PendingUserModel.findOne({ email });
    if (!pendingUser) {
      return res.status(404).json({ error: 'No active pending registration found for this email.' });
    }

    await PendingUserModel.findByIdAndUpdate(pendingUser.id, {
      otpEmailCode: emailOtp,
      otpExpires
    });

    latestOTPs = { email, emailOtp, phoneOtp: null };
    logOTPsToConsole(email, emailOtp, 'N/A');
    const emailResult = await sendEmailOTP(email, emailOtp, null);
    await AuditLogModel.log('OTP_RESENT', email, ip, 'User requested new Email OTP.');

    res.status(200).json({
      message: 'New OTP code has been sent to your email.',
      previewUrl: emailResult ? emailResult.previewUrl : null
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP code.' });
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

    if (decoded.email === 'admin@gmail.com') {
      const accessToken = jwt.sign(
        { id: 'admin', email: 'admin@gmail.com', isAdmin: true },
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
      return res.status(200).json({ user: { id: 'admin', name: 'Shop Manager', email: 'admin@gmail.com', isAdmin: true } });
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

export const getLatestOtp = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  res.status(200).json(latestOTPs);
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email) {
      return res.status(400).json({ error: 'Please enter your email address.' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    const resetOtp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await UserModel.findByIdAndUpdate(user.id, {
      otpEmailCode: resetOtp,
      otpExpires
    });

    latestOTPs = { email, emailOtp: resetOtp, phoneOtp: null };
    logOTPsToConsole(email, resetOtp, 'N/A');

    console.log(`[DEBUG FORGOT PASSWORD] Dispatched sendEmailOTP for reset to "${email}"...`);
    const emailResult = await sendEmailOTP(email, resetOtp, null);

    await AuditLogModel.log('PASSWORD_RESET_REQUESTED', email, ip, 'Password reset OTP code requested.');

    res.status(200).json({
      message: 'A 6-digit password reset OTP has been sent to your email.',
      email,
      previewUrl: emailResult ? emailResult.previewUrl : null,
      debugSmtpError: emailResult && !emailResult.success ? emailResult.error : null
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process forgot password request.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otpEmail, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email || !otpEmail || !password) {
      return res.status(400).json({ error: 'Please provide all details (email, OTP code, new password).' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const now = new Date();
    if (!user.otpEmailCode) {
      return res.status(400).json({ error: 'No active reset request found for this account.' });
    }

    if (!user.otpExpires || now > new Date(user.otpExpires)) {
      return res.status(400).json({ error: 'Reset OTP has expired. Please request a new code.' });
    }

    if (user.otpEmailCode !== otpEmail) {
      return res.status(400).json({ error: 'Incorrect OTP code.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.findByIdAndUpdate(user.id, {
      password: hashedPassword,
      otpEmailCode: null,
      otpExpires: null
    });

    await AuditLogModel.log('PASSWORD_RESET_SUCCESS', email, ip, 'Password was reset successfully.');

    res.status(200).json({
      message: 'Your password has been reset successfully! Please log in with your new credentials.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};

export const sendVerifyOtpOnly = async (req, res) => {
  try {
    const { email } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is missing.' });
    }

    // Check if user already exists
    const existingEmailUser = await UserModel.findOne({ email });
    if (existingEmailUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const emailOtp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    tempVerifyOtps[email.toLowerCase()] = {
      otpEmailCode: emailOtp,
      otpExpires,
      verified: false
    };

    latestOTPs = { email, emailOtp, phoneOtp: null };
    logOTPsToConsole(email, emailOtp, 'N/A');

    const emailResult = await sendEmailOTP(email, emailOtp, null);

    await AuditLogModel.log('VERIFY_OTP_SENT', email, ip, 'Direct OTP sent for email registration verification.');

    res.status(200).json({
      message: 'Verification OTP sent to your email.',
      previewUrl: emailResult ? emailResult.previewUrl : null,
      debugSmtpError: emailResult && !emailResult.success ? emailResult.error : null
    });
  } catch (error) {
    console.error('Send verification OTP error:', error);
    res.status(500).json({ error: 'Failed to send verification OTP.' });
  }
};

export const checkVerifyOtpOnly = async (req, res) => {
  try {
    const { email, otpEmail } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email || !otpEmail) {
      return res.status(400).json({ error: 'Verification data is missing.' });
    }

    const record = tempVerifyOtps[email.toLowerCase()];
    if (!record) {
      return res.status(400).json({ error: 'No active OTP verification session found for this email.' });
    }

    const now = new Date();
    if (now > new Date(record.otpExpires)) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }

    if (record.otpEmailCode !== otpEmail) {
      return res.status(400).json({ error: 'Incorrect OTP code.' });
    }

    record.verified = true;
    await AuditLogModel.log('VERIFY_OTP_SUCCESS', email, ip, 'Email verified successfully via registration wizard.');

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.'
    });
  } catch (error) {
    console.error('Check verification OTP error:', error);
    res.status(500).json({ error: 'OTP verification check failed.' });
  }
};

export const registerDirect = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      currentLocation,
      password,
      gender,
      parentName,
      college,
      course,
      regNo,
      year,
      paymentPreference
    } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!name || !email || !phone || !currentLocation || !password) {
      return res.status(400).json({ error: 'Required fields are missing.' });
    }

    // No OTP check required for registration. Direct wizard register active.

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

    const newUser = await UserModel.create({
      name,
      email: email.toLowerCase(),
      phone,
      currentLocation,
      password: hashedPassword,
      gender: gender || "",
      parentName: parentName || "",
      college: college || "",
      course: course || "",
      regNo: regNo || "",
      year: year || "",
      paymentPreference: paymentPreference || "COD",
      isVerified: true
    });

    // Clean up verification cache
    delete tempVerifyOtps[email.toLowerCase()];

    // Generate Final JWT session keys
    const accessToken = jwt.sign(
      { id: newUser.id, email: newUser.email, isAdmin: false },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh tokens list in DB
    await UserModel.findByIdAndUpdate(newUser.id, {
      refreshTokens: [refreshToken]
    });

    // Save refresh token to HTTPOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Generate CSRF token for double-submit check
    const csrfToken = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '15m' });
    res.cookie('csrf-token', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    await AuditLogModel.log('USER_REGISTER_SUCCESS', email, ip, 'Account registered directly with wizard details.');

    const userResponse = { ...newUser };
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.status(201).json({
      message: 'Registration successful! Session authorized.',
      accessToken,
      csrfToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Direct registration error:', error);
    res.status(500).json({ error: 'Internal server error during direct registration.' });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      currentLocation,
      password,
      bankAccountHolder,
      bankName,
      bankAccountNumber,
      bankIfscCode
    } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!name || !email || !phone || !currentLocation || !password) {
      return res.status(400).json({ error: 'Required fields are missing.' });
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

    const newUser = await UserModel.create({
      name,
      email: email.toLowerCase(),
      phone,
      currentLocation,
      password: hashedPassword,
      isAdmin: true,
      bankAccountHolder: bankAccountHolder || "",
      bankName: bankName || "",
      bankAccountNumber: bankAccountNumber || "",
      bankIfscCode: bankIfscCode || "",
      isVerified: true
    });

    // Clean up verification cache
    delete tempVerifyOtps[email.toLowerCase()];

    // Generate Final JWT session keys
    const accessToken = jwt.sign(
      { id: newUser.id, email: newUser.email, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh tokens list in DB
    await UserModel.findByIdAndUpdate(newUser.id, {
      refreshTokens: [refreshToken]
    });

    // Save refresh token to HTTPOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Generate CSRF token for double-submit check
    const csrfToken = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '15m' });
    res.cookie('csrf-token', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    await AuditLogModel.log('ADMIN_REGISTER_SUCCESS', email, ip, 'Admin account registered successfully with bank details.');

    const userResponse = { ...newUser };
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.status(201).json({
      message: 'Admin registration successful! Session authorized.',
      accessToken,
      csrfToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ error: 'Internal server error during admin registration.' });
  }
};
