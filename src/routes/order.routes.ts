import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  approvePayment,
  rejectPayment,
  getPendingPayments,
  getTransactions,
  getRevenueAnalytics,
} from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/analytics/revenue', authenticate, authorize(UserRole.ADMIN), getRevenueAnalytics);
router.get('/transactions', authenticate, authorize(UserRole.ADMIN), getTransactions);
router.get('/pending-payments', authenticate, authorize(UserRole.ADMIN), getPendingPayments);
router.get('/', authenticate, authorize(UserRole.ADMIN), getOrders);
router.get('/:id', authenticate, authorize(UserRole.ADMIN), getOrderById);
router.put('/:paymentId/approve', authenticate, authorize(UserRole.ADMIN), approvePayment);
router.put('/:paymentId/reject', authenticate, authorize(UserRole.ADMIN), rejectPayment);

export default router;
