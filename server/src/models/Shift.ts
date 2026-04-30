import mongoose, { Document } from 'mongoose';

export interface IShift extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
}

const shiftSchema = new mongoose.Schema<IShift>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

export default mongoose.model<IShift>('Shift', shiftSchema);
