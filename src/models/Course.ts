import mongoose, { Schema, Model } from 'mongoose';
import { ICourse } from '../types/index.js';

const lessonSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [0, 'Duration cannot be negative'],
  },
  order: {
    type: Number,
    required: true,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  resources: [String],
});

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required'],
    },
    trailer: {
      type: String,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    lessons: [lessonSchema],
    duration: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    language: {
      type: String,
      default: 'English',
    },
    requirements: [String],
    learningOutcomes: [String],
    enrolledStudents: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  if (this.isModified('lessons')) {
    this.duration = this.lessons.reduce(
      (total, lesson) => total + lesson.duration,
      0
    );
  }
});

courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ slug: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ rating: -1 });
courseSchema.index({ enrolledStudents: -1 });
courseSchema.index({ createdAt: -1 });

export const Course: Model<ICourse> = mongoose.model<ICourse>('Course', courseSchema);
