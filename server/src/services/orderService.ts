import Order from '../models/Order.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { PriceService } from './priceService.js';
import { AppError } from '../utils/AppError.js';
import crypto from 'crypto';
import { IUser } from '../types/user.js';
import { CashfreeService } from './cashfreeService.js';

const priceService = new PriceService();
const cashfreeService = new CashfreeService();

export class OrderService {
  /**
   * @desc Initiate a buy order
   */
  async initiateBuyOrder(user: IUser, amountInr: number) {
    // Get current price
    const currentPrice = await priceService.getLatestPrice();
    if (!currentPrice) throw new AppError('Price not available', 500);

    const pricePerGram = currentPrice.buyPrice;
    const goldGrams = amountInr / pricePerGram;

    const { order_id, payment_session_id } = await cashfreeService.createOrder(
      amountInr,
      user._id.toString(),
      user.phone!,
      user.email!
    );

    // Create order in DB
    const order = await Order.create({
      user: user._id,
      type: 'buy',
      amountInr,
      goldGrams,
      pricePerGram,
      status: 'payment_pending',
      cashfreeOrderId: order_id,
      paymentSessionId: payment_session_id
    });

    return {
      order,
      order_id,
      payment_session_id,
    };
  }

  /**
   * @desc Verify payment and complete buy order
   */
  async verifyAndCompleteBuyOrder(cashfreeOrderId: string) {
    // Find order in database
    const order = await Order.findOne({ cashfreeOrderId }) as any;
    if (!order) throw new AppError('Order not found', 404);

    // Check if already completed
    if (order.status === 'completed') {
      return order;
    }

    // Fetch order status from Cashfree
    const cashfreeOrder = await cashfreeService.fetchOrder(cashfreeOrderId);

    console.log('📦 Cashfree order status:', cashfreeOrder);

    // Check payment status
    if (cashfreeOrder.order_status !== 'PAID') {
      throw new AppError('Payment not completed', 400);
    }

    // Update order status
    order.status = 'completed';
    order.completedAt = new Date();
    order.providerOrderId = cashfreeOrder.cf_order_id || cashfreeOrderId;
    order.providerPaymentId = cashfreeOrder.payment_completion_time;
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
      referenceId: order._id.toString(),
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
    }) as any;

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
      referenceId: order._id.toString(),
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