export * from './enums.js';

import { Document, Types } from 'mongoose';
import {
  UserRole,
  AuthProvider,
  CourseLevel,
  CourseLanguage,
  PaymentStatus,
  CouponType,
  PaymentGatewayType,
  OrderStatus,
  NotificationType,
  AuditAction,
} from './enums.js';

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  provider: AuthProvider;
  isVerified: boolean;
  isBlocked: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  featured: boolean;
  active: boolean;
  courseCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  subtitle?: string;
  slug: string;
  description: string;
  thumbnail: string;
  coverImage?: string;
  promoVideo?: string;
  category: Types.ObjectId;
  instructor: Types.ObjectId;
  language: CourseLanguage;
  level: CourseLevel;
  tags: string[];
  price: number;
  discountPrice?: number;
  estimatedDuration: number;
  featured: boolean;
  published: boolean;
  learningOutcomes: string[];
  requirements: string[];
  enrolledStudents: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseSection extends Document {
  _id: Types.ObjectId;
  title: string;
  course: Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILesson extends Document {
  _id: Types.ObjectId;
  section: Types.ObjectId;
  title: string;
  description?: string;
  videoUrl: string;
  preview: boolean;
  duration: number;
  attachments: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  payment?: Types.ObjectId;
  enrolledAt: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface IProgress extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  completedLessons: Types.ObjectId[];
  progressPercentage: number;
  lastLesson?: Types.ObjectId;
  updatedAt: Date;
}

export interface IReview extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  type: CouponType;
  value: number;
  minimumPurchase: number;
  maximumDiscount?: number;
  usageLimit: number;
  perUserLimit: number;
  expiresAt: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICouponUsage extends Document {
  _id: Types.ObjectId;
  coupon: Types.ObjectId;
  user: Types.ObjectId;
  order: Types.ObjectId;
  discountAmount: number;
  usedAt: Date;
}

export interface IPaymentGateway extends Document {
  _id: Types.ObjectId;
  name: string;
  type: PaymentGatewayType;
  enabled: boolean;
  displayOrder: number;
  configuration: Record<string, unknown>;
  instructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment extends Document {
  _id: Types.ObjectId;
  order: Types.ObjectId;
  gateway: Types.ObjectId;
  amount: number;
  currency: string;
  transactionId?: string;
  senderNumber?: string;
  screenshot?: string;
  status: PaymentStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  payment?: Types.ObjectId;
  originalPrice: number;
  discount: number;
  finalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlog extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  author: Types.ObjectId;
  category: string;
  tags: string[];
  published: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFAQ extends Document {
  _id: Types.ObjectId;
  question: string;
  answer: string;
  category: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactMessage extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWebsiteSettings extends Document {
  _id: Types.ObjectId;
  logo?: string;
  favicon?: string;
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    instagram?: string;
  };
  footer: {
    copyright?: string;
    description?: string;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  updatedAt: Date;
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  user?: Types.ObjectId;
  action: AuditAction;
  entity: string;
  entityId?: Types.ObjectId;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
