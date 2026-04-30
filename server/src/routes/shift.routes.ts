import express from 'express';
import {
  createShiftController,
  getMyShifts,
} from '../controllers/shift.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authMiddleware, createShiftController);
router.get('/me', authMiddleware, getMyShifts);

export default router;
