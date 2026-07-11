import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { AppError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId = req.params.courseId as string;
    const { rating, comment } = req.body;

    const enrollment = await Enrollment.findOne({
      student: req.user?._id,
      course: courseId,
    });

    if (!enrollment) {
      throw new AppError('You must be enrolled to review this course', 400);
    }

    const existingReview = await Review.findOne({
      student: req.user?._id,
      course: courseId,
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this course', 400);
    }

    const review = await Review.create({
      student: req.user?._id,
      course: new mongoose.Types.ObjectId(courseId),
      rating,
      comment,
    });

    const courseReviews = await Review.find({ course: courseId });
    const avgRating =
      courseReviews.reduce((sum, r) => sum + r.rating, 0) /
      courseReviews.length;

    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: courseReviews.length,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('student', 'fullName avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: req.params.reviewId,
      student: req.user?._id,
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();

    const courseReviews = await Review.find({ course: review.course });
    const avgRating =
      courseReviews.reduce((sum, r) => sum + r.rating, 0) /
      courseReviews.length;

    await Course.findByIdAndUpdate(review.course, {
      rating: Math.round(avgRating * 10) / 10,
    });

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const review = await Review.findOne({
      _id: req.params.reviewId,
      student: req.user?._id,
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    await review.deleteOne();

    const courseReviews = await Review.find({ course: review.course });
    const avgRating =
      courseReviews.length > 0
        ? courseReviews.reduce((sum, r) => sum + r.rating, 0) /
          courseReviews.length
        : 0;

    await Course.findByIdAndUpdate(review.course, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: courseReviews.length,
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReviewAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    await review.deleteOne();

    const courseReviews = await Review.find({ course: review.course });
    const avgRating =
      courseReviews.length > 0
        ? courseReviews.reduce((sum, r) => sum + r.rating, 0) /
          courseReviews.length
        : 0;

    await Course.findByIdAndUpdate(review.course, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: courseReviews.length,
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
