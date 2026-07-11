import { Router } from 'express';
import { body } from 'express-validator';
import {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  markAsRead,
  markAsUnread,
  deleteContactMessage,
} from '../controllers/contactMessage.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UserRole } from '../types/index.js';

const router = Router();

router.post(
  '/',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ]),
  createContactMessage
);

router.get('/', authenticate, authorize(UserRole.ADMIN), getContactMessages);
router.get('/:id', authenticate, authorize(UserRole.ADMIN), getContactMessageById);
router.put('/:id/read', authenticate, authorize(UserRole.ADMIN), markAsRead);
router.put('/:id/unread', authenticate, authorize(UserRole.ADMIN), markAsUnread);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteContactMessage);

export default router;
