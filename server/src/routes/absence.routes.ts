import { Router } from 'express';
import {
  createAbsence,
  getMyAbsences,
  getAllAbsences,
  approveAbsence,
  rejectAbsence,
  deleteAbsence,
} from '../controllers/absence.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createAbsence);
router.get('/my', authMiddleware, getMyAbsences);
router.get('/all', authMiddleware, getAllAbsences);
router.patch('/:id/approve', authMiddleware, approveAbsence);
router.patch('/:id/reject', authMiddleware, rejectAbsence);
router.delete('/:id', authMiddleware, deleteAbsence);

export default router;
