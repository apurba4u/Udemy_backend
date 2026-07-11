import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err } as AppError;
  error.message = err.message;

  if (err instanceof mongoose.Error.CastError) {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new AppError(messages.join('. '), 400);
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    error = new AppError(
      `Duplicate value for ${field}. Please use another value`,
      400
    );
  }

  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please login again', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired. Please login again', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal Server Error',
  });
};
