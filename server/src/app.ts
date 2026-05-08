import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import testRoutes from './routes/test.routes';
import shiftRoutes from './routes/shift.routes';
import swapRoutes from './routes/swap.routes';
import userRoutes from './routes/user.routes';
import attendanceRouter from './routes/attendance.routes';
const app = express();

// ✅ EZEK KELL LEGELÖL LEGYENEK
app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRouter);
app.use('/api/shifts', shiftRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/test', testRoutes);

export default app;
