import { Request, Response, NextFunction } from 'express';
import { Lesson } from '../models/Lesson.js';
import { CourseSection } from '../models/CourseSection.js';
import { Course } from '../models/Course.js';
import { AppError } from '../middleware/errorHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';

export const createLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, videoUrl, duration, preview, attachments, sectionId } = req.body;

    const section = await CourseSection.findById(sectionId);
    if (!section) {
      throw new AppError('Section not found', 404);
    }

    const course = await Course.findById(section.course);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      throw new AppError('Not authorized', 403);
    }

    const existingLessons = await Lesson.countDocuments({ section: sectionId });
    const order = existingLessons + 1;

    const lesson = await Lesson.create({
      section: sectionId,
      title,
      description,
      videoUrl,
      duration,
      preview: preview || false,
      attachments: attachments || [],
      order,
    });

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Lesson',
      entityId: lesson._id,
      details: { title, sectionId },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

export const getLessonsBySection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lessons = await Lesson.find({ section: req.params.sectionId })
      .sort('order');

    res.status(200).json({
      success: true,
      message: 'Lessons retrieved successfully',
      data: lessons,
    });
  } catch (error) {
    next(error);
  }
};

export const getLessonById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Lesson retrieved successfully',
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    const section = await CourseSection.findById(lesson.section);
    if (!section) {
      throw new AppError('Section not found', 404);
    }

    const course = await Course.findById(section.course);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      throw new AppError('Not authorized', 403);
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: updatedLesson,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    const section = await CourseSection.findById(lesson.section);
    if (!section) {
      throw new AppError('Section not found', 404);
    }

    const course = await Course.findById(section.course);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      throw new AppError('Not authorized', 403);
    }

    await lesson.deleteOne();

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.DELETE,
      entity: 'Lesson',
      entityId: lesson._id,
      details: { title: lesson.title },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const reorderLessons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lessonIds } = req.body;

    for (let i = 0; i < lessonIds.length; i++) {
      await Lesson.findByIdAndUpdate(lessonIds[i], { order: i + 1 });
    }

    res.status(200).json({
      success: true,
      message: 'Lessons reordered successfully',
    });
  } catch (error) {
    next(error);
  }
};
