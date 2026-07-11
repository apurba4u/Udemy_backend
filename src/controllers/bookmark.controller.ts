import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';

const bookmarkSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  timestamp: { type: Number, default: 0 },
}, { timestamps: true });

bookmarkSchema.index({ student: 1, lesson: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export const addBookmark = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lessonId, courseId, timestamp } = req.body;

    const existingBookmark = await Bookmark.findOne({
      student: req.user?._id,
      lesson: lessonId,
    });

    if (existingBookmark) {
      throw new AppError('Bookmark already exists', 400);
    }

    const bookmark = await Bookmark.create({
      student: req.user?._id,
      lesson: lessonId,
      course: courseId,
      timestamp: timestamp || 0,
    });

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Bookmark',
      entityId: bookmark._id,
      details: { lessonId, courseId },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Bookmark added successfully',
      data: bookmark,
    });
  } catch (error) {
    next(error);
  }
};

export const removeBookmark = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      student: req.user?._id,
      lesson: req.params.lessonId,
    });

    if (!bookmark) {
      throw new AppError('Bookmark not found', 404);
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.DELETE,
      entity: 'Bookmark',
      entityId: bookmark._id,
      details: { lessonId: req.params.lessonId },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getBookmarksByLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookmark = await Bookmark.findOne({
      student: req.user?._id,
      lesson: req.params.lessonId,
    });

    res.status(200).json({
      success: true,
      message: 'Bookmark retrieved successfully',
      data: { isBookmarked: !!bookmark },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookmarksByCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookmarks = await Bookmark.find({
      student: req.user?._id,
      course: req.params.courseId,
    })
      .populate('lesson', 'title duration')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      message: 'Bookmarks retrieved successfully',
      data: bookmarks,
    });
  } catch (error) {
    next(error);
  }
};
