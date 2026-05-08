import User from '../models/User';
import Attendance from '../models/Attendance';

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

  // Check if already checked in today without checkout
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await Attendance.findOne({
    userId: user._id,
    checkIn: { $gte: today },
    checkOut: { $exists: false },
  });

  if (existing) throw new Error('Already checked in');

  const attendance = await Attendance.create({
    userId: user._id,
    checkIn: new Date(),
  });

  return {
    message: `Welcome, ${user.firstName}!`,
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
