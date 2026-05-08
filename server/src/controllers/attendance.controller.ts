import { Request, Response } from 'express';
import * as attendanceService from '../services/attendance.services';

export const checkIn = async (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ message: 'PIN is required' });

    const result = await attendanceService.checkIn(pin);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const checkOut = async (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ message: 'PIN is required' });

    const result = await attendanceService.checkOut(pin);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
