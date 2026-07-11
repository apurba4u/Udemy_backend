import mongoose, { Schema } from 'mongoose';
import { IReview } from '../types/index.js';

const reviewSchema = new Schema<IReview>(
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ student: 1, course: 1 }, { unique: true });
reviewSchema.index({ course: 1 });
reviewSchema.index({ rating: 1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
