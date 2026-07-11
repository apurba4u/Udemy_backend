import mongoose, { Schema, Model } from 'mongoose';
import { IPaymentGateway, PaymentGatewayType } from '../types/index.js';

const paymentGatewaySchema = new Schema<IPaymentGateway>(
  {
    name: {
      type: String,
      required: [true, 'Gateway name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(PaymentGatewayType),
      required: [true, 'Gateway type is required'],
      unique: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    configuration: {
      type: Schema.Types.Mixed,
      default: {},
    },
    instructions: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentGatewaySchema.index({ type: 1 });
paymentGatewaySchema.index({ enabled: 1 });
paymentGatewaySchema.index({ displayOrder: 1 });

export const PaymentGateway: Model<IPaymentGateway> =
  mongoose.model<IPaymentGateway>('PaymentGateway', paymentGatewaySchema);
