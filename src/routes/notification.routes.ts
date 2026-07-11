import { Router } from 'express';
import {
  getNotifications,
  getAllNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
} from '../controllers/notification.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.get('/stats', authenticate, getNotificationStats);
router.get('/', authenticate, getNotifications);
router.get('/all', authenticate, authorize(UserRole.ADMIN), getAllNotifications);
router.post('/', authenticate, authorize(UserRole.ADMIN), createNotification);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);

export default router;
