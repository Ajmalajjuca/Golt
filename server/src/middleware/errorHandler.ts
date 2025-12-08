import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { config } from "../config/config.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  if (config.nodeEnv === "development") {
    console.error("Error 💥", err);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    let message = "Duplicate field value entered";
    
    if (field === 'email') {
      message = "Email already exists. Please use a different email.";
    } else if (field === 'phone') {
      message = "Phone number already exists. Please use a different phone number.";
    }
    
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors || {})
      .map((val: any) => val.message)
      .join(", ");
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Token expired", 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
};
