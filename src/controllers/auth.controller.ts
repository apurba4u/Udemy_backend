import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { UserRole, AuthProvider } from '../types/index.js';
import { sendTokenResponse } from '../utils/token.js';
import { AppError } from '../middleware/errorHandler.js';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
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

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.isBlocked) {
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
      throw new AppError('Invalid credentials', 401);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(res, user, 200, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  res
    .cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
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

    sendTokenResponse(res, user, 200, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};
