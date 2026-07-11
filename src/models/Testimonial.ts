import mongoose, { Schema, Model, Document } from 'mongoose';

interface ITestimonial extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  designation: string;
  company?: string;
  photo?: string;
  review: string;
  rating: number;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    company: { type: String },
    photo: { type: String },
    review: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Testimonial: Model<ITestimonial> = mongoose.model<ITestimonial>('Testimonial', testimonialSchema);
