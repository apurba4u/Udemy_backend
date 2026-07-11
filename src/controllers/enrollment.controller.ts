import { Request, Response, NextFunction } from 'express';
import { Enrollment } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { AppError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

export const enrollInCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId = req.params.courseId as string;

    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (!course.isPublished) {
      throw new AppError('Course is not available for enrollment', 400);
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user?._id,
      course: courseId,
    });

    if (existingEnrollment) {
      throw new AppError('Already enrolled in this course', 400);
    }

    const enrollment = await Enrollment.create({
      student: req.user?._id,
      course: new mongoose.Types.ObjectId(courseId),
    });

    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledStudents: 1 },
    });

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEnrollments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollments = await Enrollment.find({ student: req.user?._id })
      .populate({
        path: 'course',
        select: 'title thumbnail instructor rating enrolledStudents',
        populate: {
          path: 'instructor',
          select: 'name avatar',
        },
      })
      .sort('-lastAccessedAt');

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

export const getEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user?._id,
      course: req.params.courseId,
    }).populate({
      path: 'course',
      populate: [
        {
          path: 'instructor',
          select: 'name email avatar',
        },
        {
          path: 'category',
          select: 'name slug',
        },
      ],
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId = req.params.courseId as string;
    const lessonId = req.params.lessonId as string;

    const enrollment = await Enrollment.findOne({
      student: req.user?._id,
      course: courseId,
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    const lessonObjectId = enrollment.completedLessons.find(
      (id) => id.toString() === lessonId
    );

    if (!lessonObjectId) {
      enrollment.completedLessons.push(lessonId as unknown as import('mongoose').Types.ObjectId);

      const course = await Course.findById(courseId);
      if (course) {
        enrollment.progress =
          (enrollment.completedLessons.length / course.lessons.length) * 100;
      }

      enrollment.lastAccessedAt = new Date();
      await enrollment.save();
    }

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const unenrollFromCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollment = await Enrollment.findOneAndDelete({
      student: req.user?._id,
      course: req.params.courseId,
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    await Course.findByIdAndUpdate(req.params.courseId, {
      $inc: { enrolledStudents: -1 },
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course',
    });
  } catch (error) {
    next(error);
  }
};

export const getEnrolledStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollments = await Enrollment.find({
      course: req.params.courseId,
    })
      .populate('student', 'name email avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};
