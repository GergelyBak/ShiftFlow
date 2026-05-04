import { z } from 'zod';

export const createShiftSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  targetUserId: z.string().optional(), // ✅ opcionális
});
