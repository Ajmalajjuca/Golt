import express from 'express';
import { AlertController } from '../controllers/alertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, AlertController.createAlert);
router.get('/', protect, AlertController.getAlerts);
router.delete('/:id', protect, AlertController.deleteAlert);

export default router;
