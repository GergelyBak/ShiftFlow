import mongoose from 'mongoose';

// Explicit database name, so the app never falls back to Mongo's default "test"
export const DB_NAME = process.env.MONGO_DB_NAME || 'shiftflow';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, { dbName: DB_NAME });
    console.log(`MongoDB connected (${DB_NAME})`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
