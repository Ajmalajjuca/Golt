/**
 * Custom application error class for handling operational errors gracefully
 */
export class AppError extends Error {
  public statusCode: number;
  public status: 'fail' | 'error';
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture the stack trace (excluding the constructor call)
    Error.captureStackTrace(this, this.constructor);
  }
}
