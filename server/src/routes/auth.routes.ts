import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registerSchema } from '../validators/authValidator';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', authMiddleware, changePassword);

export default router;
