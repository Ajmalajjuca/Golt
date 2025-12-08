import express from 'express';
import { getWallet, getTransactions } from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getWallet);
router.get('/transactions', getTransactions);

export default router;
