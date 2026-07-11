import { Router } from 'express';
import { body } from 'express-validator';
import {
  createTestimonial,
  getTestimonials,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialActive,
  reorderTestimonials,
} from '../controllers/testimonial.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/', getTestimonials);
router.get('/all', authenticate, authorize(UserRole.ADMIN), getAllTestimonials);
router.get('/:id', getTestimonialById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('designation').trim().notEmpty().withMessage('Designation is required'),
    body('review').trim().notEmpty().withMessage('Review is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ]),
  createTestimonial
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  updateTestimonial
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteTestimonial
);

router.put(
  '/:id/toggle-active',
  authenticate,
  authorize(UserRole.ADMIN),
  toggleTestimonialActive
);

router.put(
  '/reorder',
  authenticate,
  authorize(UserRole.ADMIN),
  reorderTestimonials
);

export default router;
