import nodemailer from 'nodemailer';
import logger from '../lib/logger.js';
import { env } from './env.js';

export const createTransporter = () => {
  const secure = env.SMTP_SECURE || env.SMTP_PORT === 465;
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    connectionTimeout: 10000,
  });
  return transporter;
};

export const verifySMTP = async () => {
  if (env.NODE_ENV === 'production') return;
  try {
    const transporter = createTransporter();
    const ok = await transporter.verify();
    if (ok) {
      logger.info(`SMTP verified: host=${env.SMTP_HOST} port=${env.SMTP_PORT} secure=${env.SMTP_SECURE || env.SMTP_PORT === 465}`);
    } else {
      logger.error('SMTP verification failed');
    }
  } catch (err) {
    logger.error(`SMTP verify error: ${err.message}`);
  }
};
