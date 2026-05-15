import { Router } from 'express';
import {
  setAvailability,
  deleteAvailability,
  getMyAvailability,
  getAllAvailability,
} from '../controllers/availability.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, setAvailability);
router.delete('/', authMiddleware, deleteAvailability);
router.get('/my', authMiddleware, getMyAvailability);
router.get('/all', authMiddleware, getAllAvailability);

export default router;
