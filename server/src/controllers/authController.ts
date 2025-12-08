import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiResponse } from "../utils/apiResponse.js";

const authService = new AuthService();



/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, phone, } = req.body;
  
  // Validate required fields
  if (!name || !email || !password || !phone) {
    return ApiResponse.error(res, "Name, email, password, and phone are required", 400);
  }
  
  const { user, token } = await authService.register(name, email, password, phone);
  return ApiResponse.success(res, { user, token }, "User registered successfully", 201);
});


/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) return ApiResponse.error(res, "Email and password are required", 400);
  const { user, token } = await authService.login(email, password);
  return ApiResponse.success(res, { user, token }, "User logged in successfully", 200);
});

/**
 * @desc Google Login
 * @route POST /api/auth/google
 * @access Public
 */
export const googleLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { idToken } = req.body;
  if (!idToken) return ApiResponse.error(res, "idToken is required", 400);
  
  const { user, token } = await authService.googleLogin(idToken);
  return ApiResponse.success(res, { user, token }, "Google login successful", 200);
});


