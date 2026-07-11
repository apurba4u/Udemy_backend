import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate } from '../utils/pagination.js';

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, read, type } = req.query;

    const query: Record<string, unknown> = { user: req.user?._id };

    if (read !== undefined) {
      query.read = read === 'true';
    }

    if (type) {
      query.type = type as string;
    }

    const result = await paginate(Notification.find(query), {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      sort: '-createdAt',
    });

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, read, type, user } = req.query;

    const query: Record<string, unknown> = {};

    if (read !== undefined) {
      query.read = read === 'true';
    }

    if (type) {
      query.type = type as string;
    }

    if (user) {
      query.user = user as string;
    }

    const result = await paginate(Notification.find(query), {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      sort: '-createdAt',
      populate: ['user'],
    });

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, type, title, message } = req.body;

    const notification = await Notification.create({
      user,
      type,
      title,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await Notification.updateMany(
      { user: req.user?._id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const total = await Notification.countDocuments({ user: req.user?._id });
    const unread = await Notification.countDocuments({
      user: req.user?._id,
      read: false,
    });

    const byType = await Notification.aggregate([
      { $match: { user: req.user?._id } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      message: 'Notification stats retrieved successfully',
      data: {
        total,
        unread,
        byType,
      },
    });
  } catch (error) {
    next(error);
  }
};
