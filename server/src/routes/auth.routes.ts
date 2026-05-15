import express from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registerSchema } from '../validators/authValidator';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
