// server/src/routes/user.routes.ts
import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import User from '../models/User';

const router = express.Router();

router.get('/', authMiddleware, async (req: any, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const users = await User.find().select('_id firstName lastName email');
  res.json(users);
});

export default router;
