import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import { config } from "../config/config.js";

interface AuthRequest extends Request {
  user?: any;
}

export const protect = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1].replace(/"/g, "");
  }

  console.log("Token:", token);

  if (!token) {
    return next(new AppError("Not authorized to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret!) as JwtPayload;
    console.log('decoded:',decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError("Not authorized to access this route", 401));
  }
});

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return next(
        new AppError(`User role ${req.user?.role} is not authorized to access this route`, 403)
      );
    }
    next();
  };
};
