import { Router } from 'express';
import { body } from 'express-validator';
import {
  createFAQ,
  getFAQs,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
  toggleFAQActive,
  reorderFAQs,
} from '../controllers/faq.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/', getFAQs);
router.get('/all', authenticate, authorize(UserRole.ADMIN), getAllFAQs);
router.get('/:id', getFAQById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('answer').trim().notEmpty().withMessage('Answer is required'),
  ]),
  createFAQ
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  updateFAQ
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteFAQ
);

router.put(
  '/:id/toggle-active',
  authenticate,
  authorize(UserRole.ADMIN),
  toggleFAQActive
);

router.put(
  '/reorder',
  authenticate,
  authorize(UserRole.ADMIN),
  reorderFAQs
);

export default router;
