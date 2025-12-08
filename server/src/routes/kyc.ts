import express from 'express';
import { submitKYC, getKYCStatus } from '../controllers/kycController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/submit', submitKYC);
router.get('/status', getKYCStatus);

export default router;
