import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { paginate } from '../utils/pagination.js';

export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, sort, action, entity, user, startDate, endDate } = req.query;

    const query: Record<string, unknown> = {};

    if (action) {
      query.action = action as string;
    }

    if (entity) {
      query.entity = entity as string;
    }

    if (user) {
      query.user = user as string;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        (query.createdAt as Record<string, Date>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        (query.createdAt as Record<string, Date>).$lte = new Date(endDate as string);
      }
    }

    const result = await paginate(AuditLog.find(query), {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      sort: (sort as string) || '-createdAt',
      populate: ['user'],
    });

    res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('user', 'fullName email');

    if (!log) {
      res.status(404).json({
        success: false,
        message: 'Audit log not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Audit log retrieved successfully',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    const todayCount = await AuditLog.countDocuments({ createdAt: { $gte: today } });
    const weekCount = await AuditLog.countDocuments({ createdAt: { $gte: thisWeek } });
    const monthCount = await AuditLog.countDocuments({ createdAt: { $gte: thisMonth } });
    const totalCount = await AuditLog.countDocuments();

    const actionStats = await AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const entityStats = await AuditLog.aggregate([
      { $group: { _id: '$entity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      message: 'Audit stats retrieved successfully',
      data: {
        todayCount,
        weekCount,
        monthCount,
        totalCount,
        actionStats,
        entityStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
