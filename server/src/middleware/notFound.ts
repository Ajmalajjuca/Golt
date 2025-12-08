import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};
