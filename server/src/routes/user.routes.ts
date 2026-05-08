import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import User from '../models/User';
import { generateUniquePin } from '../services/attendance.services';

const router = express.Router();

// GET all users (admin only)
router.get('/', authMiddleware, async (req: any, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const users = await User.find().select('_id firstName lastName email pin');
  res.json(users);
});

// PATCH assign PIN to existing user (admin only)
router.patch('/:id/assign-pin', authMiddleware, async (req: any, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const pin = await generateUniquePin();
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { pin },
      { new: true },
    ).select('_id firstName lastName email pin');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'PIN assigned', user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
