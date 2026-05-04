import express from 'express';
import {
  createShiftController,
  deleteShiftController,
  getMyShifts,
} from '../controllers/shift.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
// shift.routes.ts
router.delete('/:id', authMiddleware, deleteShiftController);
router.post('/', authMiddleware, createShiftController);
router.get('/me', authMiddleware, getMyShifts);

export default router;
