import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { UserRole, AuthProvider, AuditAction } from '../types/index.js';
import { sendTokenResponse } from '../utils/token.js';
import { AppError } from '../middleware/errorHandler.js';
import { createAuditLog } from '../services/audit.service.js';
import crypto from 'crypto';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role: UserRole.STUDENT,
      provider: AuthProvider.EMAIL,
      isVerified: false,
    });

    await createAuditLog({
      user: user._id,
      action: AuditAction.CREATE,
      entity: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip,
    });

    sendTokenResponse(res, user, 201, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      await createAuditLog({
        action: AuditAction.LOGIN,
        entity: 'User',
        details: { email, status: 'failed', reason: 'user_not_found' },
        ipAddress: req.ip,
      });
      throw new AppError('Invalid credentials', 401);
    }

    if (user.isBlocked) {
      await createAuditLog({
        user: user._id,
        action: AuditAction.LOGIN,
        entity: 'User',
        entityId: user._id,
        details: { status: 'failed', reason: 'account_blocked' },
        ipAddress: req.ip,
      });
      throw new AppError('Your account has been blocked', 403);
    }

    if (user.provider !== AuthProvider.EMAIL) {
      throw new AppError(
        'This account uses social login. Please log in with Google.',
        400
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await createAuditLog({
        user: user._id,
        action: AuditAction.LOGIN,
        entity: 'User',
        entityId: user._id,
        details: { status: 'failed', reason: 'invalid_password' },
        ipAddress: req.ip,
      });
      throw new AppError('Invalid credentials', 401);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await createAuditLog({
      user: user._id,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: user._id,
      details: { status: 'success' },
      ipAddress: req.ip,
    });

    sendTokenResponse(res, user, 200, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  if (req.user) {
    await createAuditLog({
      user: req.user._id,
      action: AuditAction.LOGOUT,
      entity: 'User',
      entityId: req.user._id,
      ipAddress: req.ip,
    });
  }

  res
    .cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .status(200)
    .json({
      success: true,
      message: 'Logged out successfully',
    });
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, phone, avatar } = req.body;
    const updateData: Record<string, string> = {};

    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user?._id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await createAuditLog({
      user: user._id,
      action: AuditAction.UPDATE,
      entity: 'User',
      entityId: user._id,
      details: { updatedFields: Object.keys(updateData) },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Please provide current and new password', 400);
    }

    const user = await User.findById(req.user?._id).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    await createAuditLog({
      user: user._id,
      action: AuditAction.UPDATE,
      entity: 'User',
      entityId: user._id,
      details: { action: 'password_changed' },
      ipAddress: req.ip,
    });

    sendTokenResponse(res, user, 200, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Please provide your email', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('No account with that email exists', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    user.set('resetPasswordToken', crypto.createHash('sha256').update(resetToken).digest('hex'));
    user.set('resetPasswordExpire', resetTokenExpiry);
    await user.save({ validateBeforeSave: false });

    await createAuditLog({
      user: user._id,
      action: AuditAction.UPDATE,
      entity: 'User',
      entityId: user._id,
      details: { action: 'password_reset_requested' },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset token sent to email',
      data: { resetToken },
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new AppError('Please provide token and new password', 400);
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = password;
    user.set('resetPasswordToken', undefined);
    user.set('resetPasswordExpire', undefined);
    await user.save();

    await createAuditLog({
      user: user._id,
      action: AuditAction.UPDATE,
      entity: 'User',
      entityId: user._id,
      details: { action: 'password_reset_completed' },
      ipAddress: req.ip,
    });

    sendTokenResponse(res, user, 200, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, fullName, avatar } = req.body;

    if (!email || !fullName) {
      throw new AppError('Please provide email and full name', 400);
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        fullName,
        email: email.toLowerCase(),
        avatar,
        provider: AuthProvider.GOOGLE,
        isVerified: true,
        password: crypto.randomBytes(32).toString('hex'),
      });
    } else if (user.provider !== AuthProvider.GOOGLE) {
      throw new AppError(
        'This email is already registered with email/password. Please log in with email.',
        400
      );
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await createAuditLog({
      user: user._id,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: user._id,
      details: { method: 'google', status: 'success' },
      ipAddress: req.ip,
    });

    sendTokenResponse(res, user, 200, 'Google login successful');
  } catch (error) {
    next(error);
  }
};
