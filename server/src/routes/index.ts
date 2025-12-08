import express, { Request, Response, Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';


import priceRoutes from './price.js';
import kycRoutes from './kyc.js';
import orderRoutes from './orders.js';
import walletRoutes from './wallet.js';

const router: Router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/price', priceRoutes);
router.use('/kyc', kycRoutes);
router.use('/orders', orderRoutes);
router.use('/wallet', walletRoutes);




export default router;
