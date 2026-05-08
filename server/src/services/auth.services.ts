import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateUniquePin } from './attendance.services';

export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) => {
  // check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // generate unique PIN
  const pin = await generateUniquePin();

  // create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    pin,
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' },
  );

  return { token, pin: user.pin };
};
