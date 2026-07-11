import crypto from 'crypto';
import { User } from '../models/User.js';
import { IUser, AuthProvider, UserRole } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email: email.toLowerCase() });
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return User.findById(id);
};

export const createUser = async (data: {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  provider?: AuthProvider;
}): Promise<IUser> => {
  return User.create({
    fullName: data.fullName,
    email: data.email.toLowerCase(),
    password: data.password,
    role: data.role || UserRole.STUDENT,
    provider: data.provider || AuthProvider.EMAIL,
  });
};

export const createGoogleUser = async (data: {
  fullName: string;
  email: string;
  avatar?: string;
}): Promise<IUser> => {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    existingUser.lastLogin = new Date();
    await existingUser.save({ validateBeforeSave: false });
    return existingUser;
  }

  return User.create({
    fullName: data.fullName,
    email: data.email.toLowerCase(),
    avatar: data.avatar,
    provider: AuthProvider.GOOGLE,
    isVerified: true,
    password: crypto.randomBytes(32).toString('hex'),
  });
};

export const generateResetToken = async (email: string): Promise<string> => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new AppError('No account with that email exists', 404);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  user.set('resetPasswordToken', resetToken);
  user.set('resetPasswordExpire', resetTokenExpiry);
  await user.save({ validateBeforeSave: false });

  return resetToken;
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<IUser> => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = newPassword;
  user.set('resetPasswordToken', undefined);
  user.set('resetPasswordExpire', undefined);
  await user.save();

  return user;
};
