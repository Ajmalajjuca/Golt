import express, { Router } from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { createUser, deleteUser, getUser, getUsers, updateUser } from '../controllers/userController.js';


const router: Router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getUsers)
  .post(authorize('admin'), createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

export default router;
