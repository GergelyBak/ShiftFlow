import { z } from 'zod';

export const createShiftSchema = z.object({
  userId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});
