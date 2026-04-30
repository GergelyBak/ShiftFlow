import express from 'express';
import { register, login } from '../controllers/auth.controller'; // 🔥 EZ KELL
import { validate } from '../middleware/validate';
import { registerSchema } from '../validators/authValidator';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', login); // 🔥 EZ HIÁNYZOTT

export default router;
