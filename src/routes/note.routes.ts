import { Router } from 'express';
import { body } from 'express-validator';
import {
  createNote,
  getNotesByLesson,
  getNotesByCourse,
  updateNote,
  deleteNote,
} from '../controllers/note.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/lesson/:lessonId', authenticate, authorize(UserRole.STUDENT), getNotesByLesson);
router.get('/course/:courseId', authenticate, authorize(UserRole.STUDENT), getNotesByCourse);

router.post(
  '/',
  authenticate,
  authorize(UserRole.STUDENT),
  validate([
    body('lessonId').notEmpty().withMessage('Lesson ID is required'),
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ]),
  createNote
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.STUDENT),
  validate([
    body('content').trim().notEmpty().withMessage('Content is required'),
  ]),
  updateNote
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.STUDENT),
  deleteNote
);

export default router;
