import User from '../models/User';
import Attendance from '../models/Attendance';
import { isGermanHoliday } from '../utils/holidays';
import { fromZonedTime } from 'date-fns-tz';

export const calcAutoBreak = (workedHours: number): number => {
  if (workedHours > 9) return 45;
  if (workedHours > 6) return 30;
  if (workedHours > 5) return 15;
  return 0;
};

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

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const existing = await Attendance.findOne({
    userId: user._id,
    checkIn: { $gte: since24h },
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

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const attendance = await Attendance.findOne({
    userId: user._id,
    checkIn: { $gte: since24h },
    checkOut: { $exists: false },
  });

  if (!attendance) throw new Error('No active check-in found');

  const checkOutTime = new Date();
  attendance.checkOut = checkOutTime;

  const workedMs = checkOutTime.getTime() - attendance.checkIn.getTime();
  const workedHours = workedMs / 1000 / 60 / 60;
  attendance.breakMinutes = calcAutoBreak(workedHours);

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

const countWorkdays = (start: string, end: string): number => {
  const d = new Date(start + 'T12:00:00');
  const last = new Date(end + 'T12:00:00');
  let count = 0;
  while (d <= last) {
    const day = d.getDay();
    if (day !== 0 && day !== 1) count++; // Tue–Sat
    d.setDate(d.getDate() + 1);
  }
  return count;
};

// Get attendance summary (admin) — hours + holiday hours + overtime
export const getAttendanceSummary = async (start: string, end: string) => {
  const timezone = 'Europe/Berlin';

  const startDate = fromZonedTime(`${start}T00:00:00`, timezone);
  const endDate = fromZonedTime(`${end}T23:59:59`, timezone);

  const records = await Attendance.find({
    checkIn: { $gte: startDate, $lte: endDate },
    status: 'approved',
  }).populate('userId', 'firstName lastName email weeklyHourLimit employeeType hourlyRate');

  const workdays = countWorkdays(start, end);
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
          weeklyHourLimit: user.weeklyHourLimit ?? null,
          employeeType: user.employeeType ?? null,
          hourlyRate: user.hourlyRate ?? null,
        },
        normalHours: 0,
        holidayHours: 0,
        totalHours: 0,
        vacationDays: 0,
        sickDays: 0,
        timeOffDays: 0,
      };
    }

    const entryType = (record as any).type || 'work';

    let hours: number;
    if (entryType === 'paid_vacation' || entryType === 'sick_leave' || entryType === 'time_off') {
      hours = 8;
      if (entryType === 'paid_vacation') summary[userId].vacationDays += 1;
      else if (entryType === 'sick_leave') summary[userId].sickDays += 1;
      else summary[userId].timeOffDays += 1;
    } else {
      if (!record.checkOut) continue;
      const diff = new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime();
      const breakMs = (record.breakMinutes || 0) * 60 * 1000;
      hours = (diff - breakMs) / 1000 / 60 / 60;
    }

    if (record.isHoliday) {
      summary[userId].holidayHours += hours;
    } else {
      summary[userId].normalHours += hours;
    }

    summary[userId].totalHours += hours;
  }

  const calendarDays = (new Date(end + 'T12:00:00').getTime() - new Date(start + 'T12:00:00').getTime()) / 86400000 + 1;
  const MINIJOB_MONTHLY_LIMIT = 603;

  return Object.values(summary).map((s) => {
    const totalHours = Math.round((s.totalHours + s.holidayHours * 0.5) * 100) / 100;

    let expectedHours: number | null = null;
    if (s.user.employeeType === 'minijob' && s.user.hourlyRate) {
      const monthlyMaxHours = MINIJOB_MONTHLY_LIMIT / s.user.hourlyRate;
      expectedHours = Math.round(monthlyMaxHours * (calendarDays / 30) * 100) / 100;
    } else if (s.user.weeklyHourLimit != null) {
      expectedHours = Math.round((workdays / 5) * s.user.weeklyHourLimit * 100) / 100;
    }

    const hoursForOvertime = totalHours - (s.timeOffDays * 8);
    const overtime = expectedHours != null
      ? Math.round((hoursForOvertime - expectedHours) * 100) / 100
      : null;

    return {
      ...s,
      normalHours: Math.round(s.normalHours * 100) / 100,
      holidayHours: Math.round(s.holidayHours * 100) / 100,
      holidayBonus: Math.round(s.holidayHours * 0.5 * 100) / 100,
      totalHours,
      expectedHours,
      overtime,
    };
  });
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
  })
    .populate('userId', 'firstName lastName email')
    .sort({ checkIn: 1 });

  return records.map((r) => {
    const entryType = (r as any).type || 'work';
    const isAbsence = entryType === 'paid_vacation' || entryType === 'sick_leave' || entryType === 'time_off';

    const hours = isAbsence
      ? 8
      : r.checkOut
        ? (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime() - (r.breakMinutes || 0) * 60 * 1000) / 1000 / 60 / 60
        : 0;

    return {
      date: r.checkIn,
      checkIn: isAbsence ? null : r.checkIn,
      checkOut: isAbsence ? null : r.checkOut,
      breakMinutes: isAbsence ? 0 : (r.breakMinutes || 0),
      hours: Math.round(hours * 100) / 100,
      isHoliday: r.isHoliday,
      type: entryType,
    };
  });
};

// Get cumulative overtime total for a user across all months
export const getMyOvertimeTotal = async (userId: string) => {
  const MINIJOB_MONTHLY_LIMIT = 603;

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const records = await Attendance.find({
    userId,
    status: 'approved',
  }).sort({ checkIn: 1 });

  if (records.length === 0) return { totalOvertime: 0 };

  const monthMap: Record<string, typeof records> = {};
  for (const record of records) {
    const d = new Date(record.checkIn);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap[key]) monthMap[key] = [];
    monthMap[key].push(record);
  }

  let totalOvertime = 0;

  for (const [key, monthRecords] of Object.entries(monthMap)) {
    const [year, month] = key.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    let actualHours = 0;
    let holidayHours = 0;
    for (const r of monthRecords) {
      const rType = (r as any).type || 'work';
      if (rType === 'paid_vacation' || rType === 'sick_leave') {
        actualHours += 8;
        continue;
      }
      if (rType === 'time_off') {
        continue; // 0 hours — deducts from overtime balance
      }
      if (!r.checkOut) continue;
      const diff = new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime();
      const breakMs = (r.breakMinutes || 0) * 60 * 1000;
      const h = (diff - breakMs) / 1000 / 60 / 60;
      actualHours += h;
      if (r.isHoliday) holidayHours += h;
    }
    actualHours += holidayHours * 0.5;

    let expectedHours: number | null = null;
    if (user.employeeType === 'minijob' && user.hourlyRate) {
      expectedHours = (MINIJOB_MONTHLY_LIMIT / user.hourlyRate) * (lastDay / 30);
    } else if (user.weeklyHourLimit != null) {
      expectedHours = (countWorkdays(start, end) / 5) * user.weeklyHourLimit;
    }

    if (expectedHours != null) {
      totalOvertime += actualHours - expectedHours;
    }
  }

  return { totalOvertime: Math.round(totalOvertime * 100) / 100 };
};
