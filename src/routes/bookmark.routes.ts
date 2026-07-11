import { Router } from 'express';
import { body } from 'express-validator';
import {
  addBookmark,
  removeBookmark,
  getBookmarksByLesson,
  getBookmarksByCourse,
} from '../controllers/bookmark.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/lesson/:lessonId', authenticate, authorize(UserRole.STUDENT), getBookmarksByLesson);
router.get('/course/:courseId', authenticate, authorize(UserRole.STUDENT), getBookmarksByCourse);

router.post(
  '/',
  authenticate,
  authorize(UserRole.STUDENT),
  validate([
    body('lessonId').notEmpty().withMessage('Lesson ID is required'),
    body('courseId').notEmpty().withMessage('Course ID is required'),
  ]),
  addBookmark
);

router.delete(
  '/lesson/:lessonId',
  authenticate,
  authorize(UserRole.STUDENT),
  removeBookmark
);

export default router;
