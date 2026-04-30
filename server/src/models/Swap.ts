import mongoose, { Document } from 'mongoose';

export interface ISwap extends Document {
  shiftId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
}

const swapSchema = new mongoose.Schema<ISwap>({
  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
});

export default mongoose.model<ISwap>('Swap', swapSchema);
