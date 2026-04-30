import { Request, Response } from 'express';
import { createShift, getUserShifts } from '../services/shift.services';

export const createShiftController = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const shift = await createShift({
      userId: req.user.id,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });

    res.status(201).json({
      id: shift._id,
      userId: shift.userId,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyShifts = async (req: any, res: Response) => {
  try {
    const shifts = await getUserShifts(req.user.id);

    res.json(shifts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
