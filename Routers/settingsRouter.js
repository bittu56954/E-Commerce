import express from 'express';
import { getSettings, updateSettings } from '../Controllers/settingsController.js';
import { verifyJWT, verifyAdmin } from '../Controllers/authController.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', verifyJWT, verifyAdmin, updateSettings);

export default router;
