import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Progress } from '../models/Progress.js';
import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { Lesson } from '../models/Lesson.js';
import { CourseSection } from '../models/CourseSection.js';
import { AppError } from '../middleware/errorHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';

export const getProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId = req.params.courseId as string;

    const enrollment = await Enrollment.findOne({
      student: req.user?._id,
      course: new mongoose.Types.ObjectId(courseId),
    });

    if (!enrollment) {
      throw new AppError('Not enrolled in this course', 403);
    }

    let progress = await Progress.findOne({
      student: req.user?._id,
      course: new mongoose.Types.ObjectId(courseId),
    }).populate('lastLesson', 'title');

    if (!progress) {
      progress = await Progress.create({
        student: req.user?._id,
        course: new mongoose.Types.ObjectId(courseId),
        completedLessons: [],
        progressPercentage: 0,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Progress retrieved successfully',
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

export const markLessonComplete = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId = req.params.courseId as string;
    const lessonId = req.params.lessonId as string;

    const enrollment = await Enrollment.findOne({
      student: req.user?._id,
      course: new mongoose.Types.ObjectId(courseId),
    });

    if (!enrollment) {
      throw new AppError('Not enrolled in this course', 403);
    }

    let progress = await Progress.findOne({
      student: req.user?._id,
      course: new mongoose.Types.ObjectId(courseId),
    });

    if (!progress) {
      progress = await Progress.create({
        student: req.user?._id,
        course: new mongoose.Types.ObjectId(courseId),
        completedLessons: [],
        progressPercentage: 0,
      });
    }

    if (!progress.completedLessons.includes(new mongoose.Types.ObjectId(lessonId))) {
      progress.completedLessons.push(new mongoose.Types.ObjectId(lessonId));
    }

    const course = await Course.findById(new mongoose.Types.ObjectId(courseId));
    if (course) {
      const sections = await CourseSection.find({ course: courseId });
      let totalLessons = 0;

      for (const section of sections) {
        const lessonCount = await Lesson.countDocuments({ section: section._id });
        totalLessons += lessonCount;
      }

      progress.progressPercentage = totalLessons > 0
        ? Math.round((progress.completedLessons.length / totalLessons) * 100)
        : 0;

      if (progress.progressPercentage === 100) {
        enrollment.completed = true;
        enrollment.completedAt = new Date();
        await enrollment.save();
      }
    }

    progress.lastLesson = lessonId as any;
    progress.updatedAt = new Date();
    await progress.save();

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.UPDATE,
      entity: 'Progress',
      entityId: progress._id,
      details: { courseId, lessonId, progress: progress.progressPercentage },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete',
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseSections = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId = req.params.courseId as string;

    const enrollment = await Enrollment.findOne({
      student: req.user?._id,
      course: new mongoose.Types.ObjectId(courseId),
    });

    if (!enrollment) {
      throw new AppError('Not enrolled in this course', 403);
    }

    const sections = await CourseSection.find({ course: new mongoose.Types.ObjectId(courseId) }).sort('order');

    const sectionsWithLessons = await Promise.all(
      sections.map(async (section) => {
        const lessons = await Lesson.find({ section: section._id }).sort('order');
        return {
          ...section.toObject(),
          lessons,
        };
      })
    );

    const progress = await Progress.findOne({
      student: req.user?._id,
      course: courseId,
    });

    res.status(200).json({
      success: true,
      message: 'Course sections retrieved successfully',
      data: {
        sections: sectionsWithLessons,
        completedLessons: progress?.completedLessons || [],
        currentLesson: progress?.lastLesson || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId).populate({
      path: 'section',
      select: 'title course',
    });

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    const section = lesson.section as any;
    const courseId = section.course;

    const enrollment = await Enrollment.findOne({
      student: req.user?._id,
      course: courseId,
    });

    if (!enrollment) {
      throw new AppError('Not enrolled in this course', 403);
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

export const getLearningAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollments = await Enrollment.find({ student: req.user?._id });
    const courseIds = enrollments.map((e) => e.course);

    const progressData = await Progress.find({
      student: req.user?._id,
      course: { $in: courseIds },
    });

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter((e) => e.completed).length;
    const inProgressCourses = totalCourses - completedCourses;

    const totalLessonsCompleted = progressData.reduce(
      (sum, p) => sum + p.completedLessons.length,
      0
    );

    const averageProgress = progressData.length > 0
      ? Math.round(
          progressData.reduce((sum, p) => sum + p.progressPercentage, 0) /
            progressData.length
        )
      : 0;

    const weeklyActivity = [
      { day: 'Mon', hours: 2.5 },
      { day: 'Tue', hours: 1.8 },
      { day: 'Wed', hours: 3.2 },
      { day: 'Thu', hours: 2.1 },
      { day: 'Fri', hours: 4.0 },
      { day: 'Sat', hours: 5.5 },
      { day: 'Sun', hours: 3.0 },
    ];

    res.status(200).json({
      success: true,
      message: 'Learning analytics retrieved successfully',
      data: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalLessonsCompleted,
        averageProgress,
        weeklyActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
