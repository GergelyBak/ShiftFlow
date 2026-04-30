import express from 'express';
import {
  requestSwapController,
  acceptSwapController,
} from '../controllers/swap.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authMiddleware, requestSwapController);
router.post('/:id/accept', authMiddleware, acceptSwapController);

export default router;
