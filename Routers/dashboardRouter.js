import express from 'express';
import { getAdminStats } from '../Controllers/orderController.js';
import { verifyJWT } from '../Controllers/authController.js';

const router = express.Router();

router.get('/stats', verifyJWT, getAdminStats);

export default router;
