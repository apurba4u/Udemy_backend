import dotenv from 'dotenv';
dotenv.config();

import type { IncomingMessage, ServerResponse } from 'http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { PaymentGateway } from '../src/models/PaymentGateway.js';
import { UserRole, PaymentGatewayType } from '../src/types/index.js';

let isConnected = false;

const connectDB = async (): Promise<void> => {
  if (isConnected && mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  await mongoose.connect(uri);
  isConnected = true;

  const adminExists = await User.findOne({ role: UserRole.ADMIN as any });
  if (!adminExists) {
    await User.create({
      fullName: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@udemy.com',
      password: process.env.ADMIN_PASSWORD || '@Admin3124',
      role: UserRole.ADMIN,
      isVerified: true,
    });
  }

  const gatewaysExist = await PaymentGateway.countDocuments();
  if (gatewaysExist === 0) {
    await PaymentGateway.insertMany([
      {
        name: 'Stripe',
        type: PaymentGatewayType.STRIPE,
        enabled: true,
        displayOrder: 1,
        configuration: {
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
          secretKey: process.env.STRIPE_SECRET_KEY || '',
        },
        instructions: 'Pay securely with credit/debit card via Stripe.',
      },
      {
        name: 'bKash',
        type: PaymentGatewayType.BKASH,
        enabled: true,
        displayOrder: 2,
        configuration: { accountNumber: '', accountHolder: '' },
        instructions: 'Send money to the bKash number below and upload the screenshot as payment proof.',
      },
      {
        name: 'Nagad',
        type: PaymentGatewayType.NAGAD,
        enabled: true,
        displayOrder: 3,
        configuration: { accountNumber: '', accountHolder: '' },
        instructions: 'Send money to the Nagad number below and upload the screenshot as payment proof.',
      },
    ]);
  }
};

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connection failed:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Database connection failed' }));
    return;
  }

  return app(req, res);
}
