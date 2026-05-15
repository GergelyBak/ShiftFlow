import mongoose, { Document, Types } from 'mongoose';

export interface IAvailability extends Document {
  userId: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'available' | 'unavailable';
}

const availabilitySchema = new mongoose.Schema<IAvailability>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['available', 'unavailable'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IAvailability>('Availability', availabilitySchema);