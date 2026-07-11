import { Router } from 'express';
import { body } from 'express-validator';
import {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
  deleteReviewAdmin,
} from '../controllers/review.controller.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/course/:courseId', optionalAuth, getCourseReviews);

router.post(
  '/course/:courseId',
  authenticate,
  authorize(UserRole.STUDENT),
  validate([
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
  ]),
  createReview
);

router.put(
  '/:reviewId',
  authenticate,
  authorize(UserRole.STUDENT),
  validate([
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
  ]),
  updateReview
);

router.delete(
  '/:reviewId',
  authenticate,
  authorize(UserRole.STUDENT),
  deleteReview
);

router.delete(
  '/admin/:reviewId',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteReviewAdmin
);

export default router;
