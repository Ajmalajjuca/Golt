import Order from '../models/Order.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { PriceService } from './priceService.js';
import { RazorpayService } from './razorpayService.js';
import { AppError } from '../utils/AppError.js';
import crypto from 'crypto';

const priceService = new PriceService();
const razorpayService = new RazorpayService();

export class OrderService {
  /**
   * @desc Initiate a buy order
   */
  async initiateBuyOrder(userId: string, amountInr: number) {
    // Get current price
    const currentPrice = await priceService.getLatestPrice();
    if (!currentPrice) throw new AppError('Price not available', 500);

    const pricePerGram = currentPrice.buyPrice;
    const goldGrams = amountInr / pricePerGram;

    // Create Razorpay order
    const razorpayOrder = await razorpayService.createOrder(amountInr);

    // Create order in DB
    const order = await Order.create({
      user: userId,
      type: 'buy',
      amountInr,
      goldGrams,
      pricePerGram,
      status: 'payment_pending',
      razorpayOrderId: razorpayOrder.id,
    });

    return {
      order,
      razorpayOrder,
    };
  }

  /**
   * @desc Verify payment and complete buy order
   */
  async verifyAndCompleteBuyOrder(
    orderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'payment_pending') {
      throw new AppError('Order is not in payment pending state', 400);
    }

    // Verify signature
    const isValid = razorpayService.verifyPaymentSignature(
      order.razorpayOrderId!,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      order.status = 'failed';
      order.failureReason = 'Payment verification failed';
      await order.save();
      throw new AppError('Payment verification failed', 400);
    }

    // Update order
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.status = 'completed';
    order.completedAt = new Date();
    
    // Mock provider order ID (SafeGold/Augmont)
    order.providerOrderId = `SG${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    await order.save();

    // Update user's gold balance
    await User.findByIdAndUpdate(order.user, {
      $inc: { goldBalance: order.goldGrams },
    });

    // Create transaction record
    await Transaction.create({
      user: order.user,
      amount: order.amountInr,
      type: 'buy_gold',
      status: 'success',
      referenceId: (order._id as any).toString(),
      description: `Bought ${order.goldGrams.toFixed(4)}g gold`,
    });

    return order;
  }

  /**
   * @desc Initiate a sell order
   */
  async initiateSellOrder(userId: string, goldGrams: number) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.goldBalance < goldGrams) {
      throw new AppError('Insufficient gold balance', 400);
    }

    // Get current price
    const currentPrice = await priceService.getLatestPrice();
    if (!currentPrice) throw new AppError('Price not available', 500);

    const pricePerGram = currentPrice.sellPrice;
    const amountInr = goldGrams * pricePerGram;

    // Create order
    const order = await Order.create({
      user: userId,
      type: 'sell',
      amountInr,
      goldGrams,
      pricePerGram,
      status: 'pending',
    });

    // Complete immediately (in production, this might be async)
    order.status = 'completed';
    order.completedAt = new Date();
    order.providerOrderId = `SG${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    await order.save();

    // Update user balances
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        goldBalance: -goldGrams,
        walletBalance: amountInr,
      },
    });

    // Create transaction record
    await Transaction.create({
      user: userId,
      amount: amountInr,
      type: 'sell_gold',
      status: 'success',
      referenceId: (order._id as any).toString(),
      description: `Sold ${goldGrams.toFixed(4)}g gold`,
    });

    return order;
  }

  /**
   * @desc Get user's orders
   */
  async getUserOrders(userId: string, limit: number = 50) {
    return await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * @desc Get order by ID
   */
  async getOrderById(orderId: string, userId: string) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }
}
