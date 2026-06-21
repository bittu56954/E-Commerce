import express from 'express';
import { placeOrder, getCustomerOrders, getAllOrders, updateOrderStatus, deleteOrder, getAdminStats, cancelOrder, getOrderById } from '../Controllers/orderController.js';
import { verifyJWT } from '../Controllers/authController.js';

const router = express.Router();

// Customer endpoints
router.post('/', verifyJWT, placeOrder);
router.get('/my-orders', verifyJWT, getCustomerOrders);
router.get('/:id', verifyJWT, getOrderById);
router.put('/:id/cancel', verifyJWT, cancelOrder);

// Admin endpoints
router.get('/all', verifyJWT, getAllOrders);
router.put('/:id/status', verifyJWT, updateOrderStatus);
router.delete('/:id', verifyJWT, deleteOrder);
router.get('/stats', verifyJWT, getAdminStats);

export default router;
