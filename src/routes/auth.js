import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword
} from '../controllers/authController.js';
import { protegerRuta } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protegerRuta, getMe);
router.put('/updateprofile', protegerRuta, updateProfile);
router.put('/updatepassword', protegerRuta, updatePassword);

export default router;
