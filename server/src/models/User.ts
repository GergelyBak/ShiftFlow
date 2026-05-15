import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
  pin: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'employee'],
      default: 'employee',
    },
    pin: {
      type: String,
      unique: true,
      length: 4,
    },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IUser>('User', userSchema);
