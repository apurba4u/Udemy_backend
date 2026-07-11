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
import { UserRole } from './types/index.js';
import bcrypt from 'bcrypt';

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

const createDefaultAdmin = async (): Promise<void> => {
  try {
    const adminExists = await User.findOne({ role: UserRole.ADMIN });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
      await User.create({
        name: 'Admin',
        email: env.ADMIN_EMAIL,
        password: hashedPassword,
        role: UserRole.ADMIN,
      });
      console.log('Default admin account created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    await createDefaultAdmin();

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
