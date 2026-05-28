import { Request, Response } from 'express';
import * as attendanceService from '../services/attendance.services';
import Attendance from '../models/Attendance';
import { isGermanHoliday } from '../utils/holidays';
import { fromZonedTime } from 'date-fns-tz';
import { calcAutoBreak } from '../services/attendance.services';

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

// GET /api/attendance/my
export const getMyAttendance = async (req: any, res: Response) => {
  try {
    const data = await attendanceService.getMyAttendance(req.user.id);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/attendance/all
export const getAllAttendance = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const data = await attendanceService.getAllAttendance();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/attendance/:id/approve
export const approveAttendance = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const data = await attendanceService.approveAttendance(req.params.id);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/attendance/:id
export const deleteAttendance = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/attendance/summary
export const getAttendanceSummary = async (req: any, res: Response) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ message: 'start and end dates required' });
    }
    const data = await attendanceService.getAttendanceSummary(
      start as string,
      end as string,
    );
    if (req.user.role !== 'admin') {
      const mine = data.filter((s: any) => s.user.id === req.user.id.toString());
      return res.status(200).json(mine);
    }
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/attendance/manual — admin
export const createManualAttendance = async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { userId, date, checkInTime, checkOutTime, breakMinutes, type } = req.body;
    const entryType: string = type || 'work';

    if (!userId || !date) {
      return res.status(400).json({ message: 'userId and date are required' });
    }
    if (entryType === 'work' && !checkInTime) {
      return res.status(400).json({ message: 'checkInTime is required for work entries' });
    }

    const timezone = 'Europe/Berlin';
    const checkIn = entryType === 'work'
      ? fromZonedTime(`${date}T${checkInTime}:00`, timezone)
      : fromZonedTime(`${date}T00:00:00`, timezone);
    const checkOut = entryType === 'work'
      ? (checkOutTime ? fromZonedTime(`${date}T${checkOutTime}:00`, timezone) : undefined)
      : fromZonedTime(`${date}T23:59:59`, timezone);
    const holiday = isGermanHoliday(checkIn);

    const attendance = await Attendance.create({
      userId,
      checkIn,
      checkOut,
      status: 'approved',
      isHoliday: holiday,
      type: entryType,
      breakMinutes: entryType !== 'work'
        ? 0
        : breakMinutes != null
          ? Number(breakMinutes)
          : checkOut
            ? calcAutoBreak((checkOut.getTime() - checkIn.getTime()) / 3600000)
            : 0,
    });

    const populated = await Attendance.findById(attendance._id).populate(
      'userId',
      'firstName lastName email',
    );

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// GET /api/attendance/detail?userId=...&start=...&end=...
export const getAttendanceDetail = async (req: any, res: Response) => {
  try {
    const { userId, start, end } = req.query;
    if (!userId || !start || !end) {
      return res.status(400).json({ message: 'userId, start and end required' });
    }
    if (req.user.role !== 'admin' && userId !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const data = await attendanceService.getAttendanceDetail(
      userId as string,
      start as string,
      end as string,
    );
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};