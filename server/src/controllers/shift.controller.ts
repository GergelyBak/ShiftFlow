import { Request, Response } from 'express';
import { createShift, getUserShifts } from '../services/shift.services';
import Shift from '../models/Shift';

export const createShiftController = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const targetUserId = req.body.targetUserId
      ? req.body.targetUserId
      : req.user.id;

    const shift = await createShift({
      userId: targetUserId,
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

export const deleteShiftController = async (req: any, res: Response) => {
  try {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    if (req.user.role !== 'admin' && shift.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Shift.findByIdAndDelete(req.params.id);

    res.json({ message: 'Shift deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateShiftController = async (req: any, res: Response) => {
  try {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    if (req.user.role !== 'admin' && shift.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    shift.startTime = req.body.startTime || shift.startTime;
    shift.endTime = req.body.endTime || shift.endTime;
    await shift.save();

    res.json(shift);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getShiftsByDate = async (req: any, res: Response) => {
  try {
    const date = new Date(req.params.date);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const shifts = await Shift.find({
      date: { $gte: start, $lte: end },
    }).populate('userId', 'firstName lastName');

    res.json(shifts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
