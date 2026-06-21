import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../Controllers/categoryController.js';
import { verifyJWT, verifyAdmin } from '../Controllers/authController.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', verifyJWT, verifyAdmin, createCategory);
router.put('/:id', verifyJWT, verifyAdmin, updateCategory);
router.delete('/:id', verifyJWT, verifyAdmin, deleteCategory);

export default router;
