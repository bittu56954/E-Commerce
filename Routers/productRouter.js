import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../Controllers/productController.js';
import { verifyJWT, verifyAdmin } from '../Controllers/authController.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', verifyJWT, verifyAdmin, createProduct);
router.put('/:id', verifyJWT, verifyAdmin, updateProduct);
router.delete('/:id', verifyJWT, verifyAdmin, deleteProduct);

export default router;
