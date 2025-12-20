import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';

/**
 * @desc Get wallet details
 * @route GET /api/wallet
 * @access Private
 */
export const getWallet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const user = await User.findById(userId).select('walletBalance goldBalance silverBalance');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Calculate portfolio stats
  const orders = await Order.find({ user: userId, type: 'buy', status: 'completed' });

  let totalInvested = 0;
  let totalGoldBought = 0;

  orders.forEach(order => {
    totalInvested += order.amountInr;
    totalGoldBought += order.metalType === 'gold' ? order.quantity : 0;
  });

  // Calculate stats
  const { PriceService, getGoldPriceService, getSilverPriceService } = await import('../services/priceService.js');

  const goldPrice = await (await getGoldPriceService()).getLatestPrice();
  const silverPrice = await (await getSilverPriceService()).getLatestPrice();

  const goldValue = user.goldBalance * (goldPrice?.sellPrice || 0);
  const silverValue = user.silverBalance * (silverPrice?.sellPrice || 0);
  const currentValue = goldValue + silverValue;

  const profitLoss = currentValue - totalInvested; // Simplified P&L calculation assuming all bought through platform

  return ApiResponse.success(res, {
    walletBalance: user.walletBalance,
    goldBalance: user.goldBalance,
    silverBalance: user.silverBalance,
    totalInvested,
    currentValue,
    goldValue,
    silverValue,
    profitLoss,
    profitLossPercentage: totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0,
  }, 'Wallet details fetched successfully');
});

/**
 * @desc Get transaction history
 * @route GET /api/wallet/transactions
 * @access Private
 */
export const getTransactions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const limit = parseInt(req.query.limit as string) || 50;
  const page = parseInt(req.query.page as string) || 1;
  const skip = (page - 1) * limit;

  const transactions = await Transaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Transaction.countDocuments({ user: userId });

  return ApiResponse.success(res, {
    transactions,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  }, 'Transactions fetched successfully');
});
