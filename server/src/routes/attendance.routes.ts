import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public — PIN alapú
router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);

// Protected
router.post(
  '/manual',
  authMiddleware,
  attendanceController.createManualAttendance,
);
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
