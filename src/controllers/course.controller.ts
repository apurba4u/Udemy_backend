import { Request, Response, NextFunction } from 'express';
import { Course } from '../models/Course.js';
import { Category } from '../models/Category.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate } from '../utils/pagination.js';

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      subtitle,
      description,
      price,
      discountPrice,
      thumbnail,
      promoVideo,
      category,
      level,
      language,
      tags,
      requirements,
      learningOutcomes,
      estimatedDuration,
    } = req.body;

    const course = await Course.create({
      title,
      subtitle,
      description,
      price,
      discountPrice,
      thumbnail,
      promoVideo,
      instructor: req.user?._id,
      category,
      level,
      language,
      tags,
      requirements,
      learningOutcomes,
      estimatedDuration,
    });

    await Category.findByIdAndUpdate(category, {
      $inc: { courseCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
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

    const query = Course.find({ published: true });

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
      message: 'Courses retrieved successfully',
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
      published: true,
    })
      .populate('instructor', 'fullName email avatar bio')
      .populate('category', 'name slug');

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Course retrieved successfully',
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
      message: 'Course retrieved successfully',
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
      message: 'Course updated successfully',
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

    course.published = true;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course published successfully',
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

    course.published = false;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course unpublished successfully',
      data: course,
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
    const courses = await Course.find({ published: true, featured: true })
      .populate('instructor', 'fullName avatar')
      .populate('category', 'name')
      .sort('-rating')
      .limit(8);

    res.status(200).json({
      success: true,
      message: 'Featured courses retrieved successfully',
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
    const courses = await Course.find({ published: true })
      .populate('instructor', 'fullName avatar')
      .populate('category', 'name')
      .sort('-enrolledStudents')
      .limit(8);

    res.status(200).json({
      success: true,
      message: 'Popular courses retrieved successfully',
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
    const courses = await Course.find({ published: true })
      .populate('instructor', 'fullName avatar')
      .populate('category', 'name')
      .sort('-createdAt')
      .limit(8);

    res.status(200).json({
      success: true,
      message: 'Latest courses retrieved successfully',
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};
