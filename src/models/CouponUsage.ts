import mongoose, { Schema, Model } from 'mongoose';
import { ICouponUsage } from '../types/index.js';

const couponUsageSchema = new Schema<ICouponUsage>(
  {
    coupon: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      required: [true, 'Coupon is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order is required'],
    },
    discountAmount: {
      type: Number,
      required: [true, 'Discount amount is required'],
      min: [0, 'Discount amount cannot be negative'],
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

couponUsageSchema.index({ coupon: 1, user: 1 });
couponUsageSchema.index({ user: 1 });

export const CouponUsage: Model<ICouponUsage> = mongoose.model<ICouponUsage>(
  'CouponUsage',
  couponUsageSchema
);
