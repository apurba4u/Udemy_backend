import { Router } from 'express';
import {
  enrollInCourse,
  getMyEnrollments,
  getEnrollment,
  unenrollFromCourse,
  getEnrolledStudents,
} from '../controllers/enrollment.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.post(
  '/course/:courseId',
  authenticate,
  authorize(UserRole.STUDENT),
  enrollInCourse
);

router.get(
  '/my-courses',
  authenticate,
  authorize(UserRole.STUDENT),
  getMyEnrollments
);

router.get(
  '/course/:courseId',
  authenticate,
  authorize(UserRole.STUDENT),
  getEnrollment
);

router.delete(
  '/course/:courseId',
  authenticate,
  authorize(UserRole.STUDENT),
  unenrollFromCourse
);

router.get(
  '/course/:courseId/students',
  authenticate,
  authorize(UserRole.ADMIN),
  getEnrolledStudents
);

export default router;
