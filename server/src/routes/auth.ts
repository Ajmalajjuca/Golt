import express, { Router } from 'express';
import { login, register, googleLogin } from '../controllers/authController.js';

const router: Router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

export default router;
