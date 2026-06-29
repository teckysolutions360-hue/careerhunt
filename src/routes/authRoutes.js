import express from 'express';
import { 
  register, 
  adminStatus,
  login, 
  googleAuth, 
  getMe,
  updateProfile,
  logout 
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.get('/admin-status', adminStatus);
router.post('/login', login);
router.post('/google', googleAuth);
router.put('/profile', protect, updateProfile);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;