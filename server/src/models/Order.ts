import mongoose, { Document, Schema, Types } from 'mongoose';

export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'payment_pending' | 'completed' | 'failed' | 'cancelled';

export interface IOrder extends Document {
  user: Types.ObjectId;
  type: OrderType;
  amountInr: number;
  goldGrams: number;
  pricePerGram: number;
  status: OrderStatus;
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  providerOrderId?: string; // SafeGold/Augmont order ID
  failureReason?: string;
  createdAt: Date;
  completedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['buy', 'sell'], required: true },
    amountInr: { type: Number, required: true },
    goldGrams: { type: Number, required: true },
    pricePerGram: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'payment_pending', 'completed', 'failed', 'cancelled'], 
      default: 'pending' 
    },
    paymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    providerOrderId: { type: String },
    failureReason: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
