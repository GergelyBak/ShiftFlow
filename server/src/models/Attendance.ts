import mongoose, { Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  userId: Types.ObjectId;
  checkIn: Date;
  checkOut?: Date;
  status: 'pending' | 'approved';
  isHoliday: boolean;
  breakMinutes: number;
  type: 'work' | 'paid_vacation' | 'sick_leave' | 'time_off';
}

const attendanceSchema = new mongoose.Schema<IAttendance>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending',
    },
    isHoliday: {
      type: Boolean,
      default: false,
    },
    breakMinutes: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['work', 'paid_vacation', 'sick_leave', 'time_off'],
      default: 'work',
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
