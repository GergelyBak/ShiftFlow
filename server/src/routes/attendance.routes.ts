import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public
router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);

// Protected
router.get(
  '/summary',
  authMiddleware,
  attendanceController.getAttendanceSummary,
);
router.get('/my', authMiddleware, attendanceController.getMyAttendance);
router.get('/all', authMiddleware, attendanceController.getAllAttendance);
router.patch(
  '/:id/approve',
  authMiddleware,
  attendanceController.approveAttendance,
);
router.delete('/:id', authMiddleware, attendanceController.deleteAttendance);

export default router;
