import { Router } from 'express';
import { body } from 'express-validator';
import {
  validateCoupon,
  createOrder,
  submitManualPayment,
  getOrderDetails,
  getMyOrders,
} from '../controllers/checkout.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post(
  '/validate-coupon',
  authenticate,
  validate([
    body('code').trim().notEmpty().withMessage('Coupon code is required'),
    body('courseId').notEmpty().withMessage('Course ID is required'),
  ]),
  validateCoupon
);

router.post(
  '/create-order',
  authenticate,
  validate([
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('gatewayId').notEmpty().withMessage('Payment gateway is required'),
  ]),
  createOrder
);

router.post(
  '/submit-payment',
  authenticate,
  validate([
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('senderNumber').trim().notEmpty().withMessage('Sender number is required'),
    body('transactionId').trim().notEmpty().withMessage('Transaction ID is required'),
  ]),
  submitManualPayment
);

router.get('/orders', authenticate, getMyOrders);
router.get('/orders/:orderId', authenticate, getOrderDetails);

export default router;
