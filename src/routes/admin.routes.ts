import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getCourses,
  toggleCoursePublish,
  deleteCourse,
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/dashboard', getDashboardStats);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/courses', getCourses);
router.put('/courses/:id/publish', toggleCoursePublish);
router.delete('/courses/:id', deleteCourse);

export default router;
