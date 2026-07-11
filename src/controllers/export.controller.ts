import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Coupon } from '../models/Coupon.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';

export const exportUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { format = 'csv' } = req.query;

    const users = await User.find()
      .select('fullName email role isVerified isBlocked createdAt')
      .sort('-createdAt');

    if (format === 'csv') {
      const headers = 'ID,Name,Email,Role,Verified,Blocked,Created At\n';
      const rows = users.map((u) =>
        `${u._id},${u.fullName},${u.email},${u.role},${u.isVerified},${u.isBlocked},${u.createdAt}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      res.send(headers + rows);
    } else {
      res.status(200).json({
        success: true,
        message: 'Users exported successfully',
        data: users,
      });
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Export',
      details: { type: 'users', format, count: users.length },
      ipAddress: req.ip,
    });
  } catch (error) {
    next(error);
  }
};

export const exportOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { format = 'csv' } = req.query;

    const orders = await Order.find()
      .populate('student', 'fullName email')
      .populate('course', 'title')
      .sort('-createdAt');

    if (format === 'csv') {
      const headers = 'ID,Student,Course,Original Price,Discount,Final Price,Status,Created At\n';
      const rows = orders.map((o) =>
        `${o._id},"${(o.student as any)?.fullName || ''}","${(o.course as any)?.title || ''}",${o.originalPrice},${o.discount},${o.finalPrice},${o.status},${o.createdAt}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
      res.send(headers + rows);
    } else {
      res.status(200).json({
        success: true,
        message: 'Orders exported successfully',
        data: orders,
      });
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Export',
      details: { type: 'orders', format, count: orders.length },
      ipAddress: req.ip,
    });
  } catch (error) {
    next(error);
  }
};

export const exportTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { format = 'csv' } = req.query;

    const transactions = await Payment.find()
      .populate('gateway', 'name')
      .sort('-createdAt');

    if (format === 'csv') {
      const headers = 'ID,Gateway,Amount,Currency,Status,Transaction ID,Created At\n';
      const rows = transactions.map((t) =>
        `${t._id},"${(t.gateway as any)?.name || ''}",${t.amount},${t.currency},${t.status},${t.transactionId || ''},${t.createdAt}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(headers + rows);
    } else {
      res.status(200).json({
        success: true,
        message: 'Transactions exported successfully',
        data: transactions,
      });
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Export',
      details: { type: 'transactions', format, count: transactions.length },
      ipAddress: req.ip,
    });
  } catch (error) {
    next(error);
  }
};

export const exportCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { format = 'csv' } = req.query;

    const coupons = await Coupon.find().sort('-createdAt');

    if (format === 'csv') {
      const headers = 'ID,Code,Type,Value,Usage Limit,Expires At,Active\n';
      const rows = coupons.map((c) =>
        `${c._id},${c.code},${c.type},${c.value},${c.usageLimit},${c.expiresAt},${c.active}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=coupons.csv');
      res.send(headers + rows);
    } else {
      res.status(200).json({
        success: true,
        message: 'Coupons exported successfully',
        data: coupons,
      });
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Export',
      details: { type: 'coupons', format, count: coupons.length },
      ipAddress: req.ip,
    });
  } catch (error) {
    next(error);
  }
};

export const exportContactMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { format = 'csv' } = req.query;

    const messages = await ContactMessage.find().sort('-createdAt');

    if (format === 'csv') {
      const headers = 'ID,Name,Email,Subject,Message,Read,Created At\n';
      const rows = messages.map((m) =>
        `${m._id},"${m.name}","${m.email}","${m.subject}","${m.message.replace(/"/g, '""')}",${m.read},${m.createdAt}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=contact-messages.csv');
      res.send(headers + rows);
    } else {
      res.status(200).json({
        success: true,
        message: 'Contact messages exported successfully',
        data: messages,
      });
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Export',
      details: { type: 'contact-messages', format, count: messages.length },
      ipAddress: req.ip,
    });
  } catch (error) {
    next(error);
  }
};
