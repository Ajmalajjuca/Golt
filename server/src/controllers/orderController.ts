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
  const { amount, metalType } = req.body;
  const user = req.user;

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (!amount || amount <= 0) {
    return next(new AppError('Please provide a valid amount', 400));
  }

  const result = await orderService.initiateBuyOrder(user, amount, metalType || 'gold');

  return ApiResponse.success(res, result, 'Buy order initiated successfully', 201);
});

/**
 * @desc Verify Cashfree payment and complete buy order
 * @route POST /api/orders/verify-payment
 * @access Private
 */
export const verifyPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { orderId } = req.body; // Cashfree order ID

  if (!orderId) {
    return next(new AppError('Order ID is required', 400));
  }

  const order = await orderService.verifyAndCompleteBuyOrder(orderId);

  return ApiResponse.success(res, order, 'Payment verified and order completed');
});

/**
 * @desc Cashfree webhook handler
 * @route POST /api/orders/webhook/cashfree
 * @access Public (but should verify signature)
 */
export const cashfreeWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { order_id, order_status, payment_time } = req.body;

  console.log('📨 Cashfree webhook received:', {
    order_id,
    order_status,
    payment_time,
  });

  if (order_status === 'PAID') {
    try {
      await orderService.verifyAndCompleteBuyOrder(order_id);
      console.log('✅ Webhook: Order completed successfully');
    } catch (error) {
      console.error('❌ Webhook: Order completion failed:', error);
    }
  }

  // Always respond 200 to acknowledge receipt
  res.status(200).send('OK');
});

/**
 * @desc Initiate sell gold order
 * @route POST /api/orders/sell
 * @access Private
 */
export const initiateSell = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { goldGrams, quantity, metalType } = req.body;
  const userId = req.user?._id;

  const qty = quantity || goldGrams; // Support both for backward compatibility

  if (!qty || qty <= 0) {
    return next(new AppError('Please provide valid quantity', 400));
  }

  const order = await orderService.initiateSellOrder(userId!.toString(), qty, metalType || 'gold');

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