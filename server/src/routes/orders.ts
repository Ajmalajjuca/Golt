import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  initiateBuy,
  verifyPayment,
  initiateSell,
  getOrders,
  getOrderById,
  cashfreeWebhook,
} from '../controllers/orderController.js';

const router = express.Router();

// Protected routes
router.post('/buy', protect, initiateBuy);
router.post('/verify-payment', protect, verifyPayment);
router.post('/sell', protect, initiateSell);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);

// Public webhook route (no auth middleware)
router.post('/webhook/cashfree', cashfreeWebhook);

export default router;