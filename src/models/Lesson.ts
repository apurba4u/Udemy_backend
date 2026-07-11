import mongoose, { Schema, Model } from 'mongoose';
import { ILesson } from '../types/index.js';

const lessonSchema = new Schema<ILesson>(
  {
    section: {
      type: Schema.Types.ObjectId,
      ref: 'CourseSection',
      required: [true, 'Section is required'],
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    preview: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [0, 'Duration cannot be negative'],
    },
    attachments: {
      type: [String],
      default: [],
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

lessonSchema.index({ section: 1, order: 1 });

export const Lesson: Model<ILesson> = mongoose.model<ILesson>(
  'Lesson',
  lessonSchema
);
