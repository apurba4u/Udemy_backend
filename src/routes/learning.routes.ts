import { Router } from 'express';
import {
  getProgress,
  markLessonComplete,
  getCourseSections,
  getLesson,
  getLearningAnalytics,
} from '../controllers/learning.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/analytics', authenticate, authorize(UserRole.STUDENT), getLearningAnalytics);
router.get('/progress/:courseId', authenticate, authorize(UserRole.STUDENT), getProgress);
router.put('/progress/:courseId/lesson/:lessonId', authenticate, authorize(UserRole.STUDENT), markLessonComplete);
router.get('/sections/:courseId', authenticate, authorize(UserRole.STUDENT), getCourseSections);
router.get('/lesson/:lessonId', authenticate, authorize(UserRole.STUDENT), getLesson);

export default router;
