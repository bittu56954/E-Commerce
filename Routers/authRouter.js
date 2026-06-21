import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  verifyJWT, 
  deleteUser, 
  getAllUsers, 
  verifyAdmin,
  verifyRegistrationOtp,
  verifyLoginOtp,
  resendOtp,
  refresh
} from '../Controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/resend-otp', resendOtp);
router.post('/refresh', refresh);

// Protected routes
router.get('/me', verifyJWT, getProfile);
router.get('/users', verifyJWT, verifyAdmin, getAllUsers);
router.delete('/users/:id', verifyJWT, verifyAdmin, deleteUser);

export default router;

