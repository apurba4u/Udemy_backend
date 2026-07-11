import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Category } from '../models/Category.js';
import { Enrollment } from '../models/Enrollment.js';
import { Review } from '../models/Review.js';
import { AppError } from '../middleware/errorHandler.js';

export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' } as Record<string, unknown>);
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const totalEnrollments = await Enrollment.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalReviews = await Review.countDocuments();

    const recentEnrollments = await Enrollment.find()
      .sort('-createdAt')
      .limit(5)
      .populate('student', 'name email')
      .populate('course', 'title');

    const topCourses = await Course.find({ isPublished: true })
      .sort('-enrolledStudents')
      .limit(5)
      .select('title enrolledStudents rating');

    const revenueData = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseData',
        },
      },
      { $unwind: '$courseData' },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          revenue: { $sum: '$courseData.price' },
          enrollments: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalStudents,
          totalCourses,
          publishedCourses,
          totalEnrollments,
          totalCategories,
          totalReviews,
        },
        recentEnrollments,
        topCourses,
        revenueData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const filter: Record<string, unknown> = {};

    if (role) {
      filter.role = role as string;
    }

    if (search) {
      const searchTerm = search as string;
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const enrollments = await Enrollment.find({ student: user._id })
      .populate('course', 'title thumbnail')
      .sort('-createdAt');

    const courseStats = await Course.countDocuments({ instructor: user._id });

    res.status(200).json({
      success: true,
      data: {
        user,
        enrollments,
        courseStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'admin') {
      throw new AppError('Cannot delete admin user', 400);
    }

    await Enrollment.deleteMany({ student: user._id });
    await Review.deleteMany({ student: user._id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
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
    const { page = 1, limit = 10, search, isPublished } = req.query;

    const query = Course.find();

    if (search) {
      const searchTerm = search as string;
      query.where('title').regex(new RegExp(searchTerm, 'i'));
    }

    if (isPublished !== undefined) {
      query.where('isPublished').equals(isPublished === 'true');
    }

    const total = await Course.countDocuments(query);
    const courses = await query
      .populate('instructor', 'name email')
      .populate('category', 'name')
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCoursePublish = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    course.isPublished = !course.isPublished;
    await course.save();

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

    await Category.findByIdAndUpdate(course.category, {
      $inc: { courseCount: -1 },
    });

    await Enrollment.deleteMany({ course: course._id });
    await Review.deleteMany({ course: course._id });
    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
