import { Document, Types } from 'mongoose';

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  courseCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILesson {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  order: number;
  isFree: boolean;
  resources?: string[];
}

export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  thumbnail: string;
  trailer?: string;
  instructor: Types.ObjectId;
  category: Types.ObjectId;
  lessons: Types.DocumentArray<ILesson>;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  requirements: string[];
  learningOutcomes: string[];
  enrolledStudents: number;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  progress: number;
  completedLessons: Types.ObjectId[];
  lastAccessedAt: Date;
  createdAt: Date;
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
