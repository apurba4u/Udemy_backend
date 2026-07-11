import { Request, Response, NextFunction } from 'express';
import { CourseSection } from '../models/CourseSection.js';
import { Course } from '../models/Course.js';
import { AppError } from '../middleware/errorHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';

export const createSection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      throw new AppError('Not authorized', 403);
    }

    const existingSections = await CourseSection.countDocuments({ course: courseId });
    const order = existingSections + 1;

    const section = await CourseSection.create({
      title,
      course: courseId,
      order,
    });

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'CourseSection',
      entityId: section._id,
      details: { title, courseId },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: section,
    });
  } catch (error) {
    next(error);
  }
};

export const getSectionsByCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sections = await CourseSection.find({ course: req.params.courseId })
      .sort('order');

    res.status(200).json({
      success: true,
      message: 'Sections retrieved successfully',
      data: sections,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const section = await CourseSection.findById(req.params.id);

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

    const updatedSection = await CourseSection.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Section updated successfully',
      data: updatedSection,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const section = await CourseSection.findById(req.params.id);

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

    await section.deleteOne();

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.DELETE,
      entity: 'CourseSection',
      entityId: section._id,
      details: { title: section.title },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const reorderSections = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sectionIds } = req.body;

    for (let i = 0; i < sectionIds.length; i++) {
      await CourseSection.findByIdAndUpdate(sectionIds[i], { order: i + 1 });
    }

    res.status(200).json({
      success: true,
      message: 'Sections reordered successfully',
    });
  } catch (error) {
    next(error);
  }
};
