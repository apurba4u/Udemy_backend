import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { User } from './models/User.js';
import { PaymentGateway } from './models/PaymentGateway.js';
import { UserRole, PaymentGatewayType } from './types/index.js';

const validateEnvironment = (): void => {
  const required = [
    'JWT_SECRET',
    'BETTER_AUTH_SECRET',
    'MONGODB_URI',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

const seedDefaultAdmin = async (): Promise<void> => {
  try {
    const adminExists = await User.findOne({ role: UserRole.ADMIN });

    if (!adminExists) {
      await User.create({
        fullName: 'Admin',
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        role: UserRole.ADMIN,
        isVerified: true,
      });
      console.log('Default admin account created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

const seedPaymentGateways = async (): Promise<void> => {
  try {
    const gatewaysExist = await PaymentGateway.countDocuments();

    if (gatewaysExist === 0) {
      await PaymentGateway.insertMany([
        {
          name: 'Stripe',
          type: PaymentGatewayType.STRIPE,
          enabled: true,
          displayOrder: 1,
          configuration: {
            publishableKey: env.STRIPE_PUBLISHABLE_KEY || '',
            secretKey: env.STRIPE_SECRET_KEY || '',
          },
          instructions: 'Pay securely with credit/debit card via Stripe.',
        },
        {
          name: 'bKash',
          type: PaymentGatewayType.BKASH,
          enabled: true,
          displayOrder: 2,
          configuration: {
            accountNumber: '',
            accountHolder: '',
          },
          instructions:
            'Send money to the bKash number below and upload the screenshot as payment proof.',
        },
        {
          name: 'Nagad',
          type: PaymentGatewayType.NAGAD,
          enabled: true,
          displayOrder: 3,
          configuration: {
            accountNumber: '',
            accountHolder: '',
          },
          instructions:
            'Send money to the Nagad number below and upload the screenshot as payment proof.',
        },
      ]);
      console.log('Default payment gateways created');
    }
  } catch (error) {
    console.error('Error creating payment gateways:', error);
  }
};

const startServer = async (): Promise<void> => {
  try {
    validateEnvironment();

    await connectDatabase();
    await seedDefaultAdmin();
    await seedPaymentGateways();

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
