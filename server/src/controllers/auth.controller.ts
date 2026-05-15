import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.services';
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

// 🟡 FORGOT PASSWORD
export const forgotPassword = async (req: any, res: any) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account with that email' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'https://shift-flow-sigma.vercel.app';
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(user.email, user.firstName, resetUrl);

    res.json({ message: 'Reset email sent' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 🔴 RESET PASSWORD
export const resetPassword = async (req: any, res: any) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
