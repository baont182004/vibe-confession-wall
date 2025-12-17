import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { createTransporter } from '../config/email.js';

export const testEmail = async (req, res) => {
  if (env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not available in production' });
  }
  const { to } = req.body;
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: 'SMTP Test Email',
      text: 'This is a test email.',
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    res.json({
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      previewUrl
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send test email', error: err.message });
  }
};
