import mongoose, { Schema, Model } from 'mongoose';
import { IProgress } from '../types/index.js';

const progressSchema = new Schema<IProgress>(
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
    completedLessons: {
      type: [Schema.Types.ObjectId],
      ref: 'Lesson',
      default: [],
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be less than 0'],
      max: [100, 'Progress cannot exceed 100'],
    },
    lastLesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

progressSchema.index({ student: 1, course: 1 }, { unique: true });
progressSchema.index({ student: 1 });

export const Progress: Model<IProgress> = mongoose.model<IProgress>(
  'Progress',
  progressSchema
);
