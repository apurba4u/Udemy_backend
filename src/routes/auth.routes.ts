import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post(
  '/register',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ]),
  register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  login
);

router.post('/logout', logout);

router.get('/me', authenticate, getMe);

router.put(
  '/profile',
  authenticate,
  validate([
    body('name').optional().trim().notEmpty(),
    body('bio').optional().trim(),
  ]),
  updateProfile
);

router.put(
  '/password',
  authenticate,
  validate([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ]),
  updatePassword
);

export default router;
