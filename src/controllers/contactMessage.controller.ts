import { Request, Response, NextFunction } from 'express';
import { ContactMessage } from '../models/ContactMessage.js';
import { AppError } from '../middleware/errorHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';
import { paginate } from '../utils/pagination.js';

export const createContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
};

export const getContactMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, sort, search, read } = req.query;

    const query = ContactMessage.find();

    if (search) {
      query.where('subject').regex(new RegExp(search as string, 'i'));
    }

    if (read !== undefined) {
      query.where('read').equals(read === 'true');
    }

    const result = await paginate(query, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sort: (sort as string) || '-createdAt',
    });

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getContactMessageById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    message.read = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message retrieved successfully',
      data: message,
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
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsUnread = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { read: false },
      { new: true }
    );

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as unread',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.DELETE,
      entity: 'ContactMessage',
      entityId: message._id,
      details: { subject: message.subject },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
