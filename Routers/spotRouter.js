import express from 'express';
import { getSpots, createSpot, updateSpot, deleteSpot } from '../Controllers/spotController.js';
import { verifyJWT, verifyAdmin } from '../Controllers/authController.js';

const router = express.Router();

router.get('/', getSpots);
router.post('/', verifyJWT, verifyAdmin, createSpot);
router.put('/:id', verifyJWT, verifyAdmin, updateSpot);
router.delete('/:id', verifyJWT, verifyAdmin, deleteSpot);

export default router;
