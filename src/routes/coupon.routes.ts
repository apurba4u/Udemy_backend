import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
  duplicateCoupon,
  getCouponAnalytics,
} from '../controllers/coupon.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserRole, CouponType } from '../types/index.js';

const router = Router();

router.get('/analytics', authenticate, authorize(UserRole.ADMIN), getCouponAnalytics);
router.get('/', authenticate, authorize(UserRole.ADMIN), getCoupons);
router.get('/:id', authenticate, authorize(UserRole.ADMIN), getCouponById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate([
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('type').isIn(Object.values(CouponType)).withMessage('Invalid coupon type'),
    body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
    body('usageLimit').isInt({ min: 1 }).withMessage('Usage limit must be at least 1'),
    body('expiresAt').isISO8601().withMessage('Expiry date is required'),
  ]),
  createCoupon
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  updateCoupon
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  deleteCoupon
);

router.put(
  '/:id/toggle-active',
  authenticate,
  authorize(UserRole.ADMIN),
  toggleCouponActive
);

router.post(
  '/:id/duplicate',
  authenticate,
  authorize(UserRole.ADMIN),
  duplicateCoupon
);

export default router;
