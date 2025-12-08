import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async route handlers to catch and forward errors to Express error middleware
 * @param fn - async route handler function
 * @returns a wrapped function with error handling
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
