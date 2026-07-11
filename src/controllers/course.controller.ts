import { Request, Response, NextFunction } from 'express';
import { Course } from '../models/Course.js';
import { Category } from '../models/Category.js';
import { AppError } from '../middleware/errorHandler.js';
import { uploadImage } from '../utils/imageUpload.js';
import { createAuditLog } from '../services/audit.service.js';
import { AuditAction } from '../types/index.js';
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
      coverImage,
      promoVideo,
      category,
      level,
      language,
      tags,
      requirements,
      learningOutcomes,
      estimatedDuration,
    } = req.body;

    let thumbnailUrl = thumbnail;
    if (thumbnail && thumbnail.startsWith('data:')) {
      thumbnailUrl = await uploadImage(thumbnail);
    }

    let coverImageUrl = coverImage;
    if (coverImage && coverImage.startsWith('data:')) {
      coverImageUrl = await uploadImage(coverImage);
    }

    const course = await Course.create({
      title,
      subtitle,
      description,
      price,
      discountPrice,
      thumbnail: thumbnailUrl,
      coverImage: coverImageUrl,
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

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.CREATE,
      entity: 'Course',
      entityId: course._id,
      details: { title: course.title },
      ipAddress: req.ip,
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
      language,
    } = req.query;

    const query = Course.find({ published: true });

    if (category) {
      query.where('category').equals(category as string);
    }

    if (level) {
      query.where('level').equals(level as string);
    }

    if (language) {
      query.where('language').equals(language as string);
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

export const getAllCourses = async (
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
      published,
      featured,
    } = req.query;

    const query = Course.find();

    if (category) {
      query.where('category').equals(category as string);
    }

    if (level) {
      query.where('level').equals(level as string);
    }

    if (published !== undefined) {
      query.where('published').equals(published === 'true');
    }

    if (featured !== undefined) {
      query.where('featured').equals(featured === 'true');
    }

    if (search) {
      query.where('title').regex(new RegExp(search as string, 'i'));
    }

    const result = await paginate(query, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
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
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      throw new AppError('Not authorized to update this course', 403);
    }

    const updateData = { ...req.body };

    if (updateData.thumbnail && updateData.thumbnail.startsWith('data:')) {
      updateData.thumbnail = await uploadImage(updateData.thumbnail);
    }

    if (updateData.coverImage && updateData.coverImage.startsWith('data:')) {
      updateData.coverImage = await uploadImage(updateData.coverImage);
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.UPDATE,
      entity: 'Course',
      entityId: course._id,
      details: { title: updatedCourse?.title },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse,
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

    if (course.instructor.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      throw new AppError('Not authorized to delete this course', 403);
    }

    await Category.findByIdAndUpdate(course.category, {
      $inc: { courseCount: -1 },
    });

    await course.deleteOne();

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.DELETE,
      entity: 'Course',
      entityId: course._id,
      details: { title: course.title },
      ipAddress: req.ip,
    });

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

    course.published = true;
    await course.save();

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.PUBLISH,
      entity: 'Course',
      entityId: course._id,
      details: { title: course.title },
      ipAddress: req.ip,
    });

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

    course.published = false;
    await course.save();

    await createAuditLog({
      user: req.user?._id,
      action: AuditAction.UNPUBLISH,
      entity: 'Course',
      entityId: course._id,
      details: { title: course.title },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Course unpublished successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCourseFeatured = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    course.featured = !course.featured;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.featured ? 'featured' : 'unfeatured'} successfully`,
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

export const duplicateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const newCourse = await Course.create({
      title: `${course.title} (Copy)`,
      subtitle: course.subtitle,
      description: course.description,
      thumbnail: course.thumbnail,
      coverImage: course.coverImage,
      promoVideo: course.promoVideo,
      category: course.category,
      instructor: course.instructor,
      language: course.language,
      level: course.level,
      tags: course.tags,
      price: course.price,
      discountPrice: course.discountPrice,
      estimatedDuration: course.estimatedDuration,
      learningOutcomes: course.learningOutcomes,
      requirements: course.requirements,
      published: false,
      featured: false,
      enrolledStudents: 0,
      rating: 0,
      reviewCount: 0,
    });

    await Category.findByIdAndUpdate(newCourse.category, {
      $inc: { courseCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Course duplicated successfully',
      data: newCourse,
    });
  } catch (error) {
    next(error);
  }
};
