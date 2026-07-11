import { Router } from 'express';
import {
  getPaymentGateways,
  getPaymentGatewayById,
  updatePaymentGateway,
  togglePaymentGateway,
  reorderPaymentGateways,
  updateStripeConfiguration,
} from '../controllers/paymentGateway.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/', getPaymentGateways);
router.get('/:id', getPaymentGatewayById);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  updatePaymentGateway
);

router.put(
  '/:id/toggle',
  authenticate,
  authorize(UserRole.ADMIN),
  togglePaymentGateway
);

router.put(
  '/reorder',
  authenticate,
  authorize(UserRole.ADMIN),
  reorderPaymentGateways
);

router.put(
  '/stripe/configuration',
  authenticate,
  authorize(UserRole.ADMIN),
  updateStripeConfiguration
);

export default router;
