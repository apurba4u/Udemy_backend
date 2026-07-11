import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { rateLimiter, authRateLimiter } from './middleware/rateLimiter.js';
import { User } from './models/User.js';
import { PaymentGateway } from './models/PaymentGateway.js';
import { UserRole, PaymentGatewayType } from './types/index.js';

import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import categoryRoutes from './routes/category.routes.js';
import sectionRoutes from './routes/section.routes.js';
import lessonRoutes from './routes/lesson.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import adminRoutes from './routes/admin.routes.js';
import websiteSettingsRoutes from './routes/websiteSettings.routes.js';
import testimonialRoutes from './routes/testimonial.routes.js';
import blogRoutes from './routes/blog.routes.js';
import faqRoutes from './routes/faq.routes.js';
import contactMessageRoutes from './routes/contactMessage.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import paymentGatewayRoutes from './routes/paymentGateway.routes.js';
import orderRoutes from './routes/order.routes.js';
import auditLogRoutes from './routes/auditLog.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import exportRoutes from './routes/export.routes.js';
import learningRoutes from './routes/learning.routes.js';
import noteRoutes from './routes/note.routes.js';
import bookmarkRoutes from './routes/bookmark.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';

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

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());

app.use(morgan('combined', {
  skip: (_req, res) => res.statusCode < 400,
}));

app.use(morgan('dev', {
  skip: (_req, res) => res.statusCode >= 400,
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(hpp());

app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/courses', rateLimiter, courseRoutes);
app.use('/api/categories', rateLimiter, categoryRoutes);
app.use('/api/sections', rateLimiter, sectionRoutes);
app.use('/api/lessons', rateLimiter, lessonRoutes);
app.use('/api/enrollments', rateLimiter, enrollmentRoutes);
app.use('/api/reviews', rateLimiter, reviewRoutes);
app.use('/api/admin', rateLimiter, adminRoutes);
app.use('/api/settings', rateLimiter, websiteSettingsRoutes);
app.use('/api/testimonials', rateLimiter, testimonialRoutes);
app.use('/api/blogs', rateLimiter, blogRoutes);
app.use('/api/faqs', rateLimiter, faqRoutes);
app.use('/api/contact-messages', rateLimiter, contactMessageRoutes);
app.use('/api/coupons', rateLimiter, couponRoutes);
app.use('/api/payment-gateways', rateLimiter, paymentGatewayRoutes);
app.use('/api/orders', rateLimiter, orderRoutes);
app.use('/api/audit-logs', rateLimiter, auditLogRoutes);
app.use('/api/notifications', rateLimiter, notificationRoutes);
app.use('/api/exports', rateLimiter, exportRoutes);
app.use('/api/learning', rateLimiter, learningRoutes);
app.use('/api/notes', rateLimiter, noteRoutes);
app.use('/api/bookmarks', rateLimiter, bookmarkRoutes);
app.use('/api/checkout', rateLimiter, checkoutRoutes);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

app.use(notFoundHandler);
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
