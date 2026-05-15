import { Request, Response } from 'express';
import Availability from '../models/Availability';

// POST /api/availability — jelölés mentése
export const setAvailability = async (req: any, res: Response) => {
  try {
    const { date, startTime, endTime, type } = req.body;
    if (!date || !startTime || !endTime || !type) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Ha már van jelölés erre a napra, felülírja
    await Availability.findOneAndDelete({
      userId: req.user.id,
      date: new Date(date),
    });

    const availability = await Availability.create({
      userId: req.user.id,
      date: new Date(date),
      startTime,
      endTime,
      type,
    });

    res.status(201).json(availability);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/availability — jelölés törlése
export const deleteAvailability = async (req: any, res: Response) => {
  try {
    await Availability.findOneAndDelete({
      userId: req.user.id,
      date: new Date(req.body.date),
    });
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/availability/my?start=...&end=... — saját jelölések
export const getMyAvailability = async (req: any, res: Response) => {
  try {
    const { start, end } = req.query;
    const filter: any = { userId: req.user.id };
    if (start && end) {
      filter.date = {
        $gte: new Date(start as string),
        $lte: new Date(end as string),
      };
    }
    const data = await Availability.find(filter).sort({ date: 1 });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/availability/all?start=...&end=... — admin látja az összest
export const getAllAvailability = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { start, end } = req.query;
    const filter: any = {};
    if (start && end) {
      filter.date = {
        $gte: new Date(start as string),
        $lte: new Date(end as string),
      };
    }
    const data = await Availability.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ date: 1 });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
