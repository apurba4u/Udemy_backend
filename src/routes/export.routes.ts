import { Router } from 'express';
import {
  exportUsers,
  exportOrders,
  exportTransactions,
  exportCoupons,
  exportContactMessages,
} from '../controllers/export.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/users', authenticate, authorize(UserRole.ADMIN), exportUsers);
router.get('/orders', authenticate, authorize(UserRole.ADMIN), exportOrders);
router.get('/transactions', authenticate, authorize(UserRole.ADMIN), exportTransactions);
router.get('/coupons', authenticate, authorize(UserRole.ADMIN), exportCoupons);
router.get('/contact-messages', authenticate, authorize(UserRole.ADMIN), exportContactMessages);

export default router;
