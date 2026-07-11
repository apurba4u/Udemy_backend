import { Router } from 'express';
import {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
} from '../controllers/auditLog.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/stats', authenticate, authorize(UserRole.ADMIN), getAuditStats);
router.get('/', authenticate, authorize(UserRole.ADMIN), getAuditLogs);
router.get('/:id', authenticate, authorize(UserRole.ADMIN), getAuditLogById);

export default router;
