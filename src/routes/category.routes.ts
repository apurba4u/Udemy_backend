import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCategory,
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/', getCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
  ]),
  createCategory
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteCategory
);

export default router;
