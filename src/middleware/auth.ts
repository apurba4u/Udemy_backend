import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { IUser, UserRole } from '../types/index.js';
import { env } from '../config/env.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, please login',
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (user.isBlocked) {
      res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired, please login again',
      });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token, please login again',
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Not authorized, please login',
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, please login',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
      return;
    }

    next();
  };
};

export const authorizeAdmin = authorize(UserRole.ADMIN);

export const authorizeStudent = authorize(UserRole.STUDENT);

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId);
      if (user && !user.isBlocked) {
        req.user = user;
      }
    }

    next();
  } catch {
    next();
  }
};
