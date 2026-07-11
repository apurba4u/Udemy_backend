import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCourse,
  getCourses,
  getAllCourses,
  getCourseBySlug,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  toggleCourseFeatured,
  getFeaturedCourses,
  getPopularCourses,
  getLatestCourses,
  duplicateCourse,
} from '../controllers/course.controller.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/featured', getFeaturedCourses);
router.get('/popular', getPopularCourses);
router.get('/latest', getLatestCourses);

router.get('/', optionalAuth, getCourses);
router.get('/all', authenticate, authorize(UserRole.ADMIN), getAllCourses);
router.get('/slug/:slug', optionalAuth, getCourseBySlug);
router.get('/:id', optionalAuth, getCourseById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('thumbnail').notEmpty().withMessage('Thumbnail is required'),
    body('category').notEmpty().withMessage('Category is required'),
  ]),
  createCourse
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  updateCourse
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteCourse
);

router.put(
  '/:id/publish',
  authenticate,
  authorize(UserRole.ADMIN),
  publishCourse
);

router.put(
  '/:id/unpublish',
  authenticate,
  authorize(UserRole.ADMIN),
  unpublishCourse
);

router.put(
  '/:id/toggle-featured',
  authenticate,
  authorize(UserRole.ADMIN),
  toggleCourseFeatured
);

router.post(
  '/:id/duplicate',
  authenticate,
  authorize(UserRole.ADMIN),
  duplicateCourse
);

export default router;
