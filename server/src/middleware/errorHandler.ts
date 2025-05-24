import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError, AppErrorInterface } from '../utils/AppError.js';

// Error handling middleware with proper type annotations
export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Ensure error object has required properties
  const error: AppErrorInterface = {
    ...err,
    statusCode: err.statusCode || 500,
    status: err.status || 'error',
    message: err.message,
    stack: err.stack,
    name: err.name,
    isOperational: err.isOperational || false,
    errors: err.errors
  };

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Handle different types of errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: error.errors || { message: error.message }
    });
    return next();
  }

  if (error.code === 'ENOENT') {
    res.status(404).json({
      status: 'error',
      message: 'Resource not found',
      details: 'The requested resource could not be found'
    });
    return next();
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      details: 'Please log in again'
    });
    return next();
  }

  // Handle token expiration
  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Token expired',
      details: 'Please log in again'
    });
    return next();
  }

  // Operational, trusted error: send message to client
  if (error.isOperational) {
    res.status(error.statusCode as number).json({
      status: error.status,
      message: error.message
    });
    return next();
  }

  // Log error in production
  console.error('ERROR ', error);

  // Send generic error response
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && {
      error: error.message,
      stack: error.stack
    })
  });

  next();
};

export default errorHandler;
