import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file
dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  
  // Database
  MONGO_URI: z.string().url(),
  
  // Security / CORS
  CLIENT_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 chars"),
  JWT_EXPIRES_IN: z.string().default('1d'),
  
  // SMTP / Email
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().default('Campus Support <noreply@campus.edu>'),
  SMTP_SECURE: z.coerce.boolean().default(false),
  
  // Application Logic
  REPORT_THRESHOLD: z.coerce.number().default(3),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(10),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  
  // Admin Seed
  ADMIN_EMAIL: z.string().email(),
  ADMIN_NICKNAME: z.string().min(2),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 4));
  process.exit(1);
}

export const env = parsed.data;
