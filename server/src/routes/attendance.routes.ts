import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller';

const router = Router();

// POST /api/attendance/checkin  — Einstempeln
router.post('/checkin', attendanceController.checkIn);

// POST /api/attendance/checkout — Ausstempeln
router.post('/checkout', attendanceController.checkOut);

export default router;
