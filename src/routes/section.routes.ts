import { Router } from 'express';
import { body } from 'express-validator';
import {
  createSection,
  getSectionsByCourse,
  updateSection,
  deleteSection,
  reorderSections,
} from '../controllers/section.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/course/:courseId', getSectionsByCourse);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('courseId').notEmpty().withMessage('Course ID is required'),
  ]),
  createSection
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
  ]),
  updateSection
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteSection
);

router.put(
  '/reorder',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    body('sectionIds').isArray().withMessage('Section IDs must be an array'),
  ]),
  reorderSections
);

export default router;
