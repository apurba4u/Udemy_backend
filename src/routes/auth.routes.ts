import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  googleLogin,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

router.post(
  '/register',
  validate([
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
      .toLowerCase(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(strongPasswordRegex)
      .withMessage(
        'Password must contain uppercase, lowercase, number, and special character (@$!%*?&#)'
      ),
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

router.post('/logout', authenticate, logout);

router.get('/me', authenticate, getMe);

router.put(
  '/profile',
  authenticate,
  validate([
    body('fullName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('phone')
      .optional()
      .trim()
      .isMobilePhone('any')
      .withMessage('Please provide a valid phone number'),
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
      .withMessage('New password must be at least 8 characters')
      .matches(strongPasswordRegex)
      .withMessage(
        'New password must contain uppercase, lowercase, number, and special character (@$!%*?&#)'
      ),
  ]),
  updatePassword
);

router.post(
  '/forgot-password',
  validate([
    body('email').isEmail().withMessage('Please provide a valid email'),
  ]),
  forgotPassword
);

router.post(
  '/reset-password',
  validate([
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(strongPasswordRegex)
      .withMessage(
        'Password must contain uppercase, lowercase, number, and special character (@$!%*?&#)'
      ),
  ]),
  resetPassword
);

router.post(
  '/google',
  validate([
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
  ]),
  googleLogin
);

export default router;
