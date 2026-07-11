import mongoose, { Schema, Model } from 'mongoose';
import { ICoupon, CouponType } from '../types/index.js';

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Code cannot exceed 20 characters'],
    },
    type: {
      type: String,
      enum: Object.values(CouponType),
      required: [true, 'Coupon type is required'],
    },
    value: {
      type: Number,
      required: [true, 'Value is required'],
      min: [0, 'Value cannot be negative'],
    },
    minimumPurchase: {
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase cannot be negative'],
    },
    maximumDiscount: {
      type: Number,
      min: [0, 'Maximum discount cannot be negative'],
    },
    usageLimit: {
      type: Number,
      required: [true, 'Usage limit is required'],
      min: [1, 'Usage limit must be at least 1'],
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: [1, 'Per user limit must be at least 1'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
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

couponSchema.index({ code: 1 });
couponSchema.index({ active: 1 });
couponSchema.index({ expiresAt: 1 });

export const Coupon: Model<ICoupon> = mongoose.model<ICoupon>(
  'Coupon',
  couponSchema
);
