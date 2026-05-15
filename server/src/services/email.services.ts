import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWelcomeEmail = async (
  to: string,
  firstName: string,
  pin: string,
  language: 'en' | 'de' = 'de',
) => {
  const content = {
    en: {
      subject: 'Welcome to ShiftFlow! 🎉',
      title: `Welcome, ${firstName}! 👋`,
      subtitle: 'Your ShiftFlow account has been created successfully.',
      pinLabel: 'Your PIN Code',
      pinNote:
        "Use this PIN to check in and out at the terminal. Keep it safe and don't share it with anyone.",
    },
    de: {
      subject: 'Willkommen bei ShiftFlow! 🎉',
      title: `Willkommen, ${firstName}! 👋`,
      subtitle: 'Dein ShiftFlow-Konto wurde erfolgreich erstellt.',
      pinLabel: 'Dein PIN-Code',
      pinNote:
        'Verwende diesen PIN, um dich am Terminal ein- und auszustempeln. Halte ihn geheim und teile ihn mit niemandem.',
    },
  };

  const t = content[language];

  await transporter.sendMail({
    from: `"ShiftFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject: t.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
        <h1 style="color: #16a34a; font-size: 24px; margin-bottom: 8px;">${t.title}</h1>
        <p style="color: #475569; font-size: 15px;">${t.subtitle}</p>
        
        <div style="background: #0f172a; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px 0;">${t.pinLabel}</p>
          <p style="color: #ffffff; font-size: 42px; font-weight: bold; letter-spacing: 12px; margin: 0; font-family: monospace;">${pin}</p>
        </div>
        
        <p style="color: #64748b; font-size: 13px;">${t.pinNote}</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© ShiftFlow 2026</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (
  to: string,
  firstName: string,
  resetUrl: string,
) => {
  await transporter.sendMail({
    from: `"ShiftFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'ShiftFlow – Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
        <h1 style="color: #16a34a; font-size: 24px; margin-bottom: 8px;">Password Reset 🔐</h1>
        <p style="color: #475569; font-size: 15px;">Hi ${firstName}, we received a request to reset your ShiftFlow password.</p>
        <p style="color: #475569; font-size: 15px;">Click the button below to set a new password. The link expires in <strong>1 hour</strong>.</p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: #16a34a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p style="color: #94a3b8; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© ShiftFlow 2026</p>
      </div>
    `,
  });
};
