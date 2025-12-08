import express from 'express';
import { 
  initiateBuy, 
  verifyPayment, 
  initiateSell, 
  getOrders, 
  getOrderById 
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/buy', initiateBuy);
router.post('/verify-payment', verifyPayment);
router.post('/sell', initiateSell);
router.get('/', getOrders);
router.get('/:id', getOrderById);

export default router;
