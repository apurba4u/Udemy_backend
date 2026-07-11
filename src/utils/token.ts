import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env.js';
import { IUser } from '../types/index.js';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as string,
  } as jwt.SignOptions);
};

export const sendTokenResponse = (
  res: Response,
  user: IUser,
  statusCode: number,
  message: string
): void => {
  const token = generateToken(user._id.toString());

  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
        },
        token,
      },
    });
};
