import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public — PIN alapú (nem kell token)
router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);

// Protected — token kell
router.get('/my', authMiddleware, attendanceController.getMyAttendance);
router.get('/all', authMiddleware, attendanceController.getAllAttendance);
router.patch(
  '/:id/approve',
  authMiddleware,
  attendanceController.approveAttendance,
);

export default router;
