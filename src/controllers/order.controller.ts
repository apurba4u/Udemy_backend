import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { AppError } from '../middleware/errorHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import {
  notifyStudentPaymentApproved,
  notifyStudentPaymentRejected,
} from '../services/notification.service.js';
import { AuditAction, OrderStatus, PaymentStatus } from '../types/index.js';
import { paginate } from '../utils/pagination.js';

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, sort, status } = req.query;

    const query = Order.find();

    if (status) {
      query.where('status').equals(status as string);
    }

    const result = await paginate(query, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sort: (sort as string) || '-createdAt',
      populate: ['student', 'course', 'payment'],
    });

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('student', 'fullName email')
      .populate('course', 'title thumbnail')
      .populate('payment');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const approvePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppError('Payment is not pending', 400);
    }

    payment.status = PaymentStatus.APPROVED;
    payment.paidAt = new Date();
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order) {
      order.status = OrderStatus.COMPLETED;
      order.payment = payment._id;
      await order.save();

      const existingEnrollment = await Enrollment.findOne({
        student: order.student,
        course: order.course,
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          student: order.student,
          course: order.course,
          payment: payment._id,
          enrolledAt: new Date(),
          completed: false,
        });

        await Course.findByIdAndUpdate(order.course, {
          $inc: { enrolledStudents: 1 },
        });
      }

      const course = await Course.findById(order.course);
      await notifyStudentPaymentApproved(order.student, course?.title || 'Unknown Course');
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.APPROVE,
      entity: 'Payment',
      entityId: payment._id,
      details: { amount: payment.amount, gateway: payment.gateway },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Payment approved successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppError('Payment is not pending', 400);
    }

    payment.status = PaymentStatus.REJECTED;
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order) {
      order.status = OrderStatus.CANCELLED;
      await order.save();

      const course = await Course.findById(order.course);
      const rejectionReason = req.body.reason || 'Payment verification failed';
      await notifyStudentPaymentRejected(order.student, course?.title || 'Unknown Course', rejectionReason);
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.REJECT,
      entity: 'Payment',
      entityId: payment._id,
      details: { amount: payment.amount, gateway: payment.gateway },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Payment rejected successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit } = req.query;

    const query = Payment.find({ status: PaymentStatus.PENDING });

    const result = await paginate(query, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sort: '-createdAt',
      populate: ['gateway', 'order'],
    });

    res.status(200).json({
      success: true,
      message: 'Pending payments retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, sort, status, gateway } = req.query;

    const query = Payment.find();

    if (status) {
      query.where('status').equals(status as string);
    }

    if (gateway) {
      query.where('gateway').equals(gateway as string);
    }

    const result = await paginate(query, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sort: (sort as string) || '-createdAt',
      populate: ['gateway', 'order'],
    });

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: PaymentStatus.APPROVED } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: PaymentStatus.APPROVED } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    const revenueByGateway = await Payment.aggregate([
      { $match: { status: PaymentStatus.APPROVED } },
      {
        $lookup: {
          from: 'paymentgateways',
          localField: 'gateway',
          foreignField: '_id',
          as: 'gatewayData',
        },
      },
      { $unwind: '$gatewayData' },
      {
        $group: {
          _id: '$gatewayData.name',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const dailySales = await Payment.aggregate([
      { $match: { status: PaymentStatus.APPROVED } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    res.status(200).json({
      success: true,
      message: 'Revenue analytics retrieved successfully',
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue,
        revenueByGateway,
        dailySales,
      },
    });
  } catch (error) {
    next(error);
  }
};
