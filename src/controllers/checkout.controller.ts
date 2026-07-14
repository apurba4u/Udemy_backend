import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Course } from '../models/Course.js';
import { Coupon } from '../models/Coupon.js';
import { CouponUsage } from '../models/CouponUsage.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { PaymentGateway } from '../models/PaymentGateway.js';
import { Enrollment } from '../models/Enrollment.js';
import { AppError } from '../middleware/errorHandler.js';
import { uploadImage } from '../utils/imageUpload.js';
import { createAuditLog } from '../services/audit.service.js';
import { createCheckoutSession } from '../services/stripe.service.js';
import {
  notifyStudentPaymentSubmitted,
  notifyAdminNewPayment,
} from '../services/notification.service.js';
import { AuditAction, OrderStatus, PaymentStatus, PaymentGatewayType } from '../types/index.js';

export const validateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      throw new AppError('Invalid coupon code', 400);
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      throw new AppError('Coupon has expired', 400);
    }

    if (course.price < coupon.minimumPurchase) {
      throw new AppError(
        `Minimum purchase amount is $${coupon.minimumPurchase}`,
        400
      );
    }

    const usageCount = await CouponUsage.countDocuments({
      coupon: coupon._id,
      user: req.user?._id,
    });

    if (usageCount >= coupon.perUserLimit) {
      throw new AppError('You have reached the usage limit for this coupon', 400);
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (course.price * coupon.value) / 100;
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.value;
    }

    const finalPrice = Math.max(0, course.price - discount);

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
        },
        originalPrice: course.price,
        discount,
        finalPrice,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId, couponCode, gatewayId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (!course.published) {
      throw new AppError('Course is not available for purchase', 400);
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user?._id,
      course: courseId,
    });

    if (existingEnrollment) {
      throw new AppError('You are already enrolled in this course', 400);
    }

    const existingOrder = await Order.findOne({
      student: req.user?._id,
      course: courseId,
      status: OrderStatus.PENDING,
    });

    // If there's an existing pending order, delete it and allow new order
    if (existingOrder) {
      await Order.findByIdAndDelete(existingOrder._id);
    }

    let discount = 0;
    let couponId = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon) {
        const usageCount = await CouponUsage.countDocuments({
          coupon: coupon._id,
          user: req.user?._id,
        });

        if (usageCount < coupon.perUserLimit && new Date(coupon.expiresAt) > new Date()) {
          if (coupon.type === 'percentage') {
            discount = (course.price * coupon.value) / 100;
            if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
              discount = coupon.maximumDiscount;
            }
          } else {
            discount = coupon.value;
          }
          couponId = coupon._id;
        }
      }
    }

    const finalPrice = Math.max(0, course.price - discount);

    const order = await Order.create({
      student: req.user?._id,
      course: courseId,
      originalPrice: course.price,
      discount,
      finalPrice,
      status: OrderStatus.PENDING,
    });

    if (couponId) {
      await CouponUsage.create({
        coupon: couponId,
        user: req.user?._id,
        order: order._id,
        discountAmount: discount,
      });
    }

    const gateway = await PaymentGateway.findById(gatewayId);

    let stripeSessionUrl = null;
    if (gateway?.type === PaymentGatewayType.STRIPE) {
      const sessionResult = await createCheckoutSession(
        order._id.toString(),
        course.title,
        finalPrice,
        courseId
      );
      if (sessionResult) {
        stripeSessionUrl = sessionResult.url;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        stripeUrl: stripeSessionUrl,
        gateway: gateway ? {
          _id: gateway._id,
          name: gateway.name,
          type: gateway.type,
          instructions: gateway.instructions,
          configuration: gateway.type === PaymentGatewayType.STRIPE
            ? { publishableKey: gateway.configuration?.publishableKey }
            : gateway.configuration,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitManualPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId, senderNumber, transactionId, screenshot } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.student.toString() !== req.user?._id.toString()) {
      throw new AppError('Not authorized', 403);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new AppError('Order is not pending', 400);
    }

    let screenshotUrl = screenshot;
    if (screenshot && screenshot.startsWith('data:')) {
      screenshotUrl = await uploadImage(screenshot);
    }

    const existingPayment = await Payment.findOne({
      transactionId,
      status: { $ne: PaymentStatus.REJECTED },
    });

    if (existingPayment) {
      throw new AppError('Transaction ID already used', 400);
    }

    const payment = await Payment.create({
      order: orderId,
      gateway: order.payment || new mongoose.Types.ObjectId(),
      amount: order.finalPrice,
      currency: 'USD',
      transactionId,
      senderNumber,
      screenshot: screenshotUrl,
      status: PaymentStatus.PENDING,
    });

    order.payment = payment._id;
    await order.save();

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Payment',
      entityId: payment._id,
      details: { orderId, transactionId },
      ipAddress: req.ip,
    });

    const course = await Course.findById(order.course);
    const gateway = await PaymentGateway.findById(order.payment);

    await notifyStudentPaymentSubmitted(
      order.student,
      course?.title || 'Unknown Course',
      gateway?.name || 'Unknown Gateway'
    );

    await notifyAdminNewPayment(
      req.user?.fullName || 'Unknown',
      course?.title || 'Unknown Course',
      gateway?.name || 'Unknown Gateway',
      order.finalPrice
    );

    res.status(201).json({
      success: true,
      message: 'Payment submitted successfully. Awaiting verification.',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('student', 'fullName email')
      .populate('course', 'title thumbnail price')
      .populate('payment');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.student._id.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      throw new AppError('Not authorized', 403);
    }

    res.status(200).json({
      success: true,
      message: 'Order details retrieved successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await Order.find({ student: req.user?._id })
      .populate('course', 'title thumbnail')
      .populate('payment')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
