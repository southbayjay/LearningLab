export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Ensure the error stack is captured
    Error.captureStackTrace(this, this.constructor);
  }
}

export interface AppErrorInterface extends Error {
  statusCode?: number;
  code?: string | number;
  status?: string | number;
  isOperational?: boolean;
  errors?: Record<string, any>;
}
