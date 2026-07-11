import { Router } from 'express';
import { body } from 'express-validator';
import {
  createLesson,
  getLessonsBySection,
  getLessonById,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from '../controllers/lesson.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/section/:sectionId', getLessonsBySection);
router.get('/:id', getLessonById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('videoUrl').notEmpty().withMessage('Video URL is required'),
    body('duration')
      .isFloat({ min: 0 })
      .withMessage('Duration must be a positive number'),
    body('sectionId').notEmpty().withMessage('Section ID is required'),
  ]),
  createLesson
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  updateLesson
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteLesson
);

router.put(
  '/reorder',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    body('lessonIds').isArray().withMessage('Lesson IDs must be an array'),
  ]),
  reorderLessons
);

export default router;
