import Order from '../models/Order.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { PriceService, getGoldPriceService, getSilverPriceService } from './priceService.js';
import { AppError } from '../utils/AppError.js';
import crypto from 'crypto';
import { IUser } from '../types/user.js';
import { CashfreeService } from './cashfreeService.js';
import { MetalType } from '../models/Price.js';

export class OrderService {
  /**
   * @desc Initiate a buy order
   */
  async initiateBuyOrder(user: IUser, amountInr: number, metalType: MetalType = 'gold') {
    // Get current price
    const priceService = metalType === 'gold' ? await getGoldPriceService() : await getSilverPriceService();
    const currentPrice = await priceService.getLatestPrice();
    if (!currentPrice) throw new AppError('Price not available', 500);

    const pricePerGram = currentPrice.buyPrice;
    const quantity = amountInr / pricePerGram;

    const cashfreeService = new CashfreeService();
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
      metalType,
      amountInr,
      quantity,
      goldGrams: metalType === 'gold' ? quantity : 0, // Backward compatibility
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
    const cashfreeService = new CashfreeService();
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

    // Update user's balance
    const updateField = order.metalType === 'gold' ? 'goldBalance' : 'silverBalance';
    await User.findByIdAndUpdate(order.user, {
      $inc: { [updateField]: order.quantity },
    });

    // Create transaction record
    await Transaction.create({
      user: order.user,
      amount: order.amountInr,
      type: order.metalType === 'gold' ? 'buy_gold' : 'buy_silver',
      metalType: order.metalType,
      quantity: order.quantity,
      status: 'success',
      referenceId: order._id.toString(),
      description: `Bought ${order.quantity.toFixed(4)}g ${order.metalType}`,
    });

    return order;
  }

  /**
   * @desc Initiate a sell order
   */
  async initiateSellOrder(userId: string, quantity: number, metalType: MetalType = 'gold') {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const userBalance = metalType === 'gold' ? user.goldBalance : user.silverBalance;
    if (userBalance < quantity) {
      throw new AppError(`Insufficient ${metalType} balance`, 400);
    }

    // Get current price
    const priceService = metalType === 'gold' ? await getGoldPriceService() : await getSilverPriceService();
    const currentPrice = await priceService.getLatestPrice();
    if (!currentPrice) throw new AppError('Price not available', 500);

    const pricePerGram = currentPrice.sellPrice;
    const amountInr = quantity * pricePerGram;

    // Create order
    const order = await Order.create({
      user: userId,
      type: 'sell',
      metalType,
      amountInr,
      quantity,
      goldGrams: metalType === 'gold' ? quantity : 0,
      pricePerGram,
      status: 'pending',
    }) as any;

    // Complete immediately (in production, this might be async)
    order.status = 'completed';
    order.completedAt = new Date();
    order.providerOrderId = `SG${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    await order.save();

    // Update user balances
    const balanceField = metalType === 'gold' ? 'goldBalance' : 'silverBalance';
    await User.findByIdAndUpdate(userId, {
      $inc: {
        [balanceField]: -quantity,
        walletBalance: amountInr,
      },
    });

    // Create transaction record
    await Transaction.create({
      user: userId,
      amount: amountInr,
      type: metalType === 'gold' ? 'sell_gold' : 'sell_silver',
      metalType,
      quantity,
      status: 'success',
      referenceId: order._id.toString(),
      description: `Sold ${quantity.toFixed(4)}g ${metalType}`,
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