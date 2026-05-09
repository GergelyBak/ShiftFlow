import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '../services/email.services';
import User from '../models/User';
import { generateUniquePin } from '../services/attendance.services';

// 🟢 REGISTER
export const register = async (req: any, res: any) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 🔍 user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔢 generate unique PIN
    const pin = await generateUniquePin();

    // 🧱 create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      pin,
    });

    // 📧 send welcome email
    await sendWelcomeEmail(email, firstName, pin, 'de');

    res.status(201).json({
      message: 'User created',
      user: {
        id: user._id,
        firstName,
        lastName,
        email,
        role: user.role,
        pin: user.pin,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 🔵 LOGIN
export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        pin: user.pin,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
