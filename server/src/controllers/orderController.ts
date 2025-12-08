import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';

const orderService = new OrderService();

/**
 * @desc Initiate buy gold order
 * @route POST /api/orders/buy
 * @access Private
 */
export const initiateBuy = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { amount } = req.body;
  const userId = req.user?._id;

  if (!amount || amount <= 0) {
    return next(new AppError('Please provide a valid amount', 400));
  }

  const result = await orderService.initiateBuyOrder(userId!.toString(), amount);
  
  return ApiResponse.success(res, result, 'Buy order initiated successfully', 201);
});

/**
 * @desc Verify payment and complete buy order
 * @route POST /api/orders/verify-payment
 * @access Private
 */
export const verifyPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!orderId || !razorpayPaymentId || !razorpaySignature) {
    return next(new AppError('Missing payment verification details', 400));
  }

  const order = await orderService.verifyAndCompleteBuyOrder(
    orderId,
    razorpayPaymentId,
    razorpaySignature
  );

  return ApiResponse.success(res, order, 'Payment verified and order completed');
});

/**
 * @desc Initiate sell gold order
 * @route POST /api/orders/sell
 * @access Private
 */
export const initiateSell = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { goldGrams } = req.body;
  const userId = req.user?._id;

  if (!goldGrams || goldGrams <= 0) {
    return next(new AppError('Please provide valid gold grams', 400));
  }

  const order = await orderService.initiateSellOrder(userId!.toString(), goldGrams);

  return ApiResponse.success(res, order, 'Gold sold successfully', 201);
});

/**
 * @desc Get user's orders
 * @route GET /api/orders
 * @access Private
 */
export const getOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const limit = parseInt(req.query.limit as string) || 50;

  const orders = await orderService.getUserOrders(userId!.toString(), limit);

  return ApiResponse.success(res, orders, 'Orders fetched successfully');
});

/**
 * @desc Get order by ID
 * @route GET /api/orders/:id
 * @access Private
 */
export const getOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  const order = await orderService.getOrderById(id, userId!.toString());

  return ApiResponse.success(res, order, 'Order fetched successfully');
});
