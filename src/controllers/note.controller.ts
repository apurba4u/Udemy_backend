import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';

const noteSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  content: { type: String, required: true },
  timestamp: { type: Number, default: 0 },
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);

export const createNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lessonId, content, timestamp } = req.body;

    const note = await Note.create({
      student: req.user?._id,
      lesson: lessonId,
      course: req.body.courseId,
      content,
      timestamp: timestamp || 0,
    });

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Note',
      entityId: note._id,
      details: { lessonId, courseId: req.body.courseId },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotesByLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notes = await Note.find({
      student: req.user?._id,
      lesson: req.params.lessonId,
    }).sort('timestamp');

    res.status(200).json({
      success: true,
      message: 'Notes retrieved successfully',
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotesByCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notes = await Note.find({
      student: req.user?._id,
      course: req.params.courseId,
    })
      .populate('lesson', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      message: 'Notes retrieved successfully',
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, student: req.user?._id },
      { content: req.body.content },
      { new: true, runValidators: true }
    );

    if (!note) {
      throw new AppError('Note not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      student: req.user?._id,
    });

    if (!note) {
      throw new AppError('Note not found', 404);
    }

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.DELETE,
      entity: 'Note',
      entityId: note._id,
      details: { lessonId: note.lesson },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
