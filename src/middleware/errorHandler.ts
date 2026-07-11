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

  if (err.name === 'MongoServerError' && (err as unknown as { code: number }).code === 11000) {
    const keyValue = (err as unknown as { keyValue: Record<string, string> }).keyValue;
    const field = Object.keys(keyValue)[0];
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

  if (err.name === 'SyntaxError' && 'body' in err) {
    error = new AppError('Invalid JSON in request body', 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      errors: ['Something went wrong'],
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.isOperational ? [message] : ['An unexpected error occurred'],
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errors: ['The requested resource does not exist'],
  });
};
