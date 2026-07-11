import { Request, Response, NextFunction } from 'express';
import { Course } from '../models/Course.js';
import { Category } from '../models/Category.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate } from '../utils/pagination.js';
import { ILesson } from '../types/index.js';
import mongoose from 'mongoose';

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      shortDescription,
      price,
      discountPrice,
      thumbnail,
      trailer,
      category,
      level,
      language,
      requirements,
      learningOutcomes,
    } = req.body;

    const course = await Course.create({
      title,
      description,
      shortDescription,
      price,
      discountPrice,
      thumbnail,
      trailer,
      instructor: req.user?._id,
      category,
      level,
      language,
      requirements,
      learningOutcomes,
    });

    await Category.findByIdAndUpdate(category, {
      $inc: { courseCount: 1 },
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page,
      limit,
      sort,
      category,
      level,
      search,
      minPrice,
      maxPrice,
      rating,
    } = req.query;

    const query = Course.find({ isPublished: true });

    if (category) {
      query.where('category').equals(category as string);
    }

    if (level) {
      query.where('level').equals(level as string);
    }

    if (search) {
      query.where('title').regex(new RegExp(search as string, 'i'));
    }

    if (minPrice) {
      query.where('price').gte(Number(minPrice));
    }

    if (maxPrice) {
      query.where('price').lte(Number(maxPrice));
    }

    if (rating) {
      query.where('rating').gte(Number(rating));
    }

    const result = await paginate(query, {
      page: Number(page) || 1,
      limit: Number(limit) || 12,
      sort: (sort as string) || '-createdAt',
      populate: ['instructor', 'category'],
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findOne({
      slug: req.params.slug,
      isPublished: true,
    })
      .populate('instructor', 'fullName email avatar bio')
      .populate('category', 'name slug');

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'fullName email avatar bio')
      .populate('category', 'name slug');

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== req.user?._id.toString()) {
      throw new AppError('Not authorized to update this course', 403);
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== req.user?._id.toString()) {
      throw new AppError('Not authorized to delete this course', 403);
    }

    await Category.findByIdAndUpdate(course.category, {
      $inc: { courseCount: -1 },
    });

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const publishCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== req.user?._id.toString()) {
      throw new AppError('Not authorized to publish this course', 403);
    }

    if (course.lessons.length === 0) {
      throw new AppError('Cannot publish course without lessons', 400);
    }

    course.isPublished = true;
    await course.save();

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const unpublishCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== req.user?._id.toString()) {
      throw new AppError('Not authorized to unpublish this course', 403);
    }

    course.isPublished = false;
    await course.save();

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const addLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== req.user?._id.toString()) {
      throw new AppError('Not authorized to add lessons', 403);
    }

    const { title, description, videoUrl, duration, isFree, resources } =
      req.body;

    const newOrder =
      course.lessons.length > 0
        ? Math.max(...course.lessons.map((l) => l.order)) + 1
        : 1;

    const newLesson: ILesson = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      videoUrl,
      duration,
      order: newOrder,
      isFree,
      resources,
    };

    course.lessons.push(newLesson);
    await course.save();

    res.status(201).json({
      success: true,
      data: course,
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
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== req.user?._id.toString()) {
      throw new AppError('Not authorized to update lessons', 403);
    }

    const lesson = course.lessons.id(req.params.lessonId as unknown as mongoose.Types.ObjectId);
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    Object.assign(lesson, req.body);
    await course.save();

    res.status(200).json({
      success: true,
      data: course,
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
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== req.user?._id.toString()) {
      throw new AppError('Not authorized to delete lessons', 403);
    }

    const lesson = course.lessons.id(req.params.lessonId as unknown as mongoose.Types.ObjectId);
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    course.lessons.pull(lesson._id);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedCourses = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courses = await Course.find({ isPublished: true, isFeatured: true })
      .populate('instructor', 'fullName avatar')
      .populate('category', 'name')
      .sort('-rating')
      .limit(8);

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

export const getPopularCourses = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate('instructor', 'fullName avatar')
      .populate('category', 'name')
      .sort('-enrolledStudents')
      .limit(8);

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestCourses = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate('instructor', 'fullName avatar')
      .populate('category', 'name')
      .sort('-createdAt')
      .limit(8);

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};
