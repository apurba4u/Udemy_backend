import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/udemy_clone',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@udemy.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '@Admin3124',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
} as const;

export type Env = typeof env;
