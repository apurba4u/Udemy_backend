import { Router } from 'express';
import { body } from 'express-validator';
import {
  createBlog,
  getBlogs,
  getPublishedBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  publishBlog,
  unpublishBlog,
} from '../controllers/blog.controller.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/', optionalAuth, getBlogs);
router.get('/published', getPublishedBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlogById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
  ]),
  createBlog
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  updateBlog
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteBlog
);

router.put(
  '/:id/publish',
  authenticate,
  authorize(UserRole.ADMIN),
  publishBlog
);

router.put(
  '/:id/unpublish',
  authenticate,
  authorize(UserRole.ADMIN),
  unpublishBlog
);

export default router;
