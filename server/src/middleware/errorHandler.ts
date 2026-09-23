import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

import { IS_PRODUCTION } from '../config/index.js';
import { AppError, AppErrorInterface } from '../utils/AppError.js';

// Client-side body errors raised by express.json (body-parser `type` codes).
const BODY_PARSER_ERRORS: Record<string, { statusCode: number; message: string }> = {
  'entity.parse.failed': { statusCode: 400, message: 'Request body must be valid JSON' },
  'entity.too.large': { statusCode: 413, message: 'Request payload must be less than 1KB' },
  'encoding.unsupported': { statusCode: 415, message: 'Unsupported content encoding' },
  'charset.unsupported': { statusCode: 415, message: 'Unsupported charset' },
  'entity.verify.failed': { statusCode: 403, message: 'Request body failed verification' },
  'request.aborted': { statusCode: 400, message: 'Request aborted' },
  'request.size.invalid': { statusCode: 400, message: 'Request size did not match Content-Length' },
  'parameters.too.many': { statusCode: 413, message: 'Too many parameters' },
};

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
    errors: err.errors,
  };

  // Log error in development
  if (!IS_PRODUCTION) {
    console.error('❌ Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle different types of errors
  const bodyError = typeof err.type === 'string' ? BODY_PARSER_ERRORS[err.type] : undefined;
  if (bodyError) {
    res.status(bodyError.statusCode).json({
      status: 'error',
      error: 'Invalid request',
      message: bodyError.message,
    });
    return next();
  }

  if (error.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: error.errors || { message: error.message },
    });
    return next();
  }

  if (error.code === 'ENOENT') {
    res.status(404).json({
      status: 'error',
      message: 'Resource not found',
      details: 'The requested resource could not be found',
    });
    return next();
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      details: 'Please log in again',
    });
    return next();
  }

  // Handle token expiration
  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Token expired',
      details: 'Please log in again',
    });
    return next();
  }

  // Operational, trusted error: send message to client
  if (error.isOperational) {
    res.status(error.statusCode as number).json({
      status: error.status,
      message: error.message,
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
    ...(!IS_PRODUCTION && {
      error: error.message,
      stack: error.stack,
    }),
  });

  next();
};

export default errorHandler;
