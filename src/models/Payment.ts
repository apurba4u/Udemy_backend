import mongoose, { Schema, Model } from 'mongoose';
import { IPayment, PaymentStatus } from '../types/index.js';

const paymentSchema = new Schema<IPayment>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order is required'],
    },
    gateway: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentGateway',
      required: [true, 'Gateway is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
      default: null,
    },
    senderNumber: {
      type: String,
      trim: true,
      default: null,
    },
    screenshot: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ gateway: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

export const Payment: Model<IPayment> = mongoose.model<IPayment>(
  'Payment',
  paymentSchema
);
