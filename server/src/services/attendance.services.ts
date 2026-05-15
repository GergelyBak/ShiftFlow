import User from '../models/User';
import Attendance from '../models/Attendance';
import { isGermanHoliday } from '../utils/holidays';
import { fromZonedTime } from 'date-fns-tz';

// Generate a unique 4-digit PIN
export const generateUniquePin = async (): Promise<string> => {
  let pin: string;
  let exists = true;

  do {
    pin = Math.floor(1000 + Math.random() * 9000).toString();
    const existing = await User.findOne({ pin });
    exists = !!existing;
  } while (exists);

  return pin;
};

// Check in with PIN
export const checkIn = async (pin: string) => {
  const user = await User.findOne({ pin });
  if (!user) throw new Error('Invalid PIN');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await Attendance.findOne({
    userId: user._id,
    checkIn: { $gte: today },
    checkOut: { $exists: false },
  });

  if (existing) throw new Error('Already checked in');

  const checkInTime = new Date();
  const holiday = isGermanHoliday(checkInTime);

  const attendance = await Attendance.create({
    userId: user._id,
    checkIn: checkInTime,
    status: 'pending',
    isHoliday: holiday,
  });

  return {
    message: `Welcome, ${user.firstName}!${holiday ? ' 🎉 Holiday today!' : ''}`,
    attendance,
  };
};

// Check out with PIN
export const checkOut = async (pin: string) => {
  const user = await User.findOne({ pin });
  if (!user) throw new Error('Invalid PIN');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({
    userId: user._id,
    checkIn: { $gte: today },
    checkOut: { $exists: false },
  });

  if (!attendance) throw new Error('No active check-in found');

  attendance.checkOut = new Date();
  await attendance.save();

  return {
    message: `Goodbye, ${user.firstName}!`,
    attendance,
  };
};

// Get own attendance (user)
export const getMyAttendance = async (userId: string) => {
  return await Attendance.find({ userId }).sort({ checkIn: -1 });
};

// Get all attendance (admin)
export const getAllAttendance = async () => {
  return await Attendance.find()
    .populate('userId', 'firstName lastName email')
    .sort({ checkIn: -1 });
};

// Approve attendance (admin)
export const approveAttendance = async (attendanceId: string) => {
  const attendance = await Attendance.findByIdAndUpdate(
    attendanceId,
    { status: 'approved' },
    { new: true },
  ).populate('userId', 'firstName lastName email');

  if (!attendance) throw new Error('Attendance record not found');

  return attendance;
};

// Get attendance summary (admin) — hours + holiday hours
export const getAttendanceSummary = async (start: string, end: string) => {
  const timezone = 'Europe/Berlin';

  const startDate = fromZonedTime(`${start}T00:00:00`, timezone);
  const endDate = fromZonedTime(`${end}T23:59:59`, timezone);

  const records = await Attendance.find({
    checkIn: { $gte: startDate, $lte: endDate },
    status: 'approved',
    checkOut: { $exists: true },
  }).populate('userId', 'firstName lastName email');

  const summary: Record<string, any> = {};

  for (const record of records) {
    const user = record.userId as any;
    const userId = user._id.toString();

    if (!summary[userId]) {
      summary[userId] = {
        user: {
          id: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        normalHours: 0,
        holidayHours: 0,
        totalHours: 0,
      };
    }

    const diff =
      new Date(record.checkOut!).getTime() - new Date(record.checkIn).getTime();
    const breakMs = (record.breakMinutes || 0) * 60 * 1000;
    const hours = (diff - breakMs) / 1000 / 60 / 60;

    if (record.isHoliday) {
      summary[userId].holidayHours += hours;
    } else {
      summary[userId].normalHours += hours;
    }

    summary[userId].totalHours += hours;
  }

  return Object.values(summary).map((s) => ({
    ...s,
    normalHours: Math.round(s.normalHours * 100) / 100,
    holidayHours: Math.round(s.holidayHours * 100) / 100,
    totalHours: Math.round(s.totalHours * 100) / 100,
    holidayBonus: Math.round(s.holidayHours * 0.5 * 100) / 100,
  }));
};
// Get detailed attendance for one user (admin)
export const getAttendanceDetail = async (
  userId: string,
  start: string,
  end: string,
) => {
  const timezone = 'Europe/Berlin';
  const startDate = fromZonedTime(`${start}T00:00:00`, timezone);
  const endDate = fromZonedTime(`${end}T23:59:59`, timezone);

  const records = await Attendance.find({
    userId,
    checkIn: { $gte: startDate, $lte: endDate },
    status: 'approved',
    checkOut: { $exists: true },
  })
    .populate('userId', 'firstName lastName email')
    .sort({ checkIn: 1 });

  return records.map((r) => {
    const diff =
      new Date(r.checkOut!).getTime() - new Date(r.checkIn).getTime();
    const breakMs = (r.breakMinutes || 0) * 60 * 1000;
    const hours = (diff - breakMs) / 1000 / 60 / 60;
    return {
      date: r.checkIn,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      breakMinutes: r.breakMinutes || 0,
      hours: Math.round(hours * 100) / 100,
      isHoliday: r.isHoliday,
    };
  });
};
