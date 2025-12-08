// controllers/userController.ts
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { UserService } from "../services/userService.js";
import { ApiResponse } from "../utils/apiResponse.js";

const userService = new UserService();

/**
 * @desc Get all users
 * @route GET /api/users
 * @access Protected (Admin)
 */
export const getUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const users = await userService.getAllUsers();
  return ApiResponse.success(res, users, "Users fetched successfully");
});

/**
 * @desc Get single user by ID
 * @route GET /api/users/:id
 * @access Protected
 */
export const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) return ApiResponse.error(res, "User not found", 404);
  return ApiResponse.success(res, user, "User fetched successfully");
});

/**
 * @desc Create a new user
 * @route POST /api/users
 * @access Admin
 */
export const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await userService.createUser(req.body);
  return ApiResponse.success(res, user, "User created successfully", 201);
});

/**
 * @desc Update an existing user
 * @route PUT /api/users/:id
 * @access Protected
 */
export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await userService.updateUser(req.params.id, req.body);
  if (!user) return ApiResponse.error(res, "User not found", 404);
  return ApiResponse.success(res, user, "User updated successfully");
});

/**
 * @desc Delete user by ID
 * @route DELETE /api/users/:id
 * @access Admin
 */
export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const deleted = await userService.deleteUser(req.params.id);
  if (!deleted) return ApiResponse.error(res, "User not found", 404);
  return ApiResponse.success(res, null, "User deleted successfully", 204);
});
