import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import testRoutes from './routes/test.routes';
import shiftRoutes from './routes/shift.routes';
import swapRoutes from './routes/swap.routes';

const app = express();
app.use('/api/test', testRoutes);
app.use('/api/swaps', swapRoutes);
app.use(cors());
app.use(express.json());
app.use('/api/shifts', shiftRoutes);
app.use('/api/auth', authRoutes);

export default app;
