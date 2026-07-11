import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { User } from './models/User.js';
import { PaymentGateway } from './models/PaymentGateway.js';
import { UserRole, PaymentGatewayType } from './types/index.js';

import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import categoryRoutes from './routes/category.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

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
