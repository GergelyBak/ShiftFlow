import mongoose, { Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  userId: Types.ObjectId;
  checkIn: Date;
  checkOut?: Date;
  status: 'pending' | 'approved';
  isHoliday: boolean;
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
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
