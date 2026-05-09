import express from 'express';
import {
  createShiftController,
  getMyShifts,
  deleteShiftController,
  updateShiftController,
  getShiftsByDate,
  getShiftsByRange,
} from '../controllers/shift.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createShiftSchema } from '../validators/shift.validator';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  validate(createShiftSchema),
  createShiftController,
);
router.get('/me', authMiddleware, getMyShifts);
router.get('/range', authMiddleware, getShiftsByRange);
router.get('/by-date/:date', authMiddleware, getShiftsByDate);
router.delete('/:id', authMiddleware, deleteShiftController);
router.patch('/:id', authMiddleware, updateShiftController);

export default router;
