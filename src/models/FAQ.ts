import mongoose, { Schema, Model } from 'mongoose';
import { IFAQ } from '../types/index.js';

const faqSchema = new Schema<IFAQ>(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      maxlength: [500, 'Question cannot exceed 500 characters'],
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
    },
    category: {
      type: String,
      trim: true,
      default: 'general',
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

faqSchema.index({ category: 1, order: 1 });
faqSchema.index({ active: 1 });

export const FAQ: Model<IFAQ> = mongoose.model<IFAQ>(
  'FAQ',
  faqSchema
);
