import mongoose, { Schema } from 'mongoose';
import { IEnrollment } from '../types/index.js';

const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be less than 0'],
      max: [100, 'Progress cannot exceed 100'],
    },
    completedLessons: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ lastAccessedAt: -1 });

export const Enrollment = mongoose.model<IEnrollment>(
  'Enrollment',
  enrollmentSchema
);
