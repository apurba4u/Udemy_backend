import mongoose, { Schema, Model } from 'mongoose';
import { ICourseSection } from '../types/index.js';

const courseSectionSchema = new Schema<ICourseSection>(
  {
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    order: {
      type: Number,
      required: [true, 'Order is required'],
      min: [0, 'Order cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

courseSectionSchema.index({ course: 1, order: 1 });

export const CourseSection: Model<ICourseSection> = mongoose.model<ICourseSection>(
  'CourseSection',
  courseSectionSchema
);
