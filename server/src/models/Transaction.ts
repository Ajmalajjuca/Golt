import mongoose, { Document, Schema, Types } from 'mongoose';

export type TransactionType = 'deposit' | 'withdrawal' | 'buy_gold' | 'sell_gold' | 'refund';
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface ITransaction extends Document {
  user: Types.ObjectId;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  referenceId?: string; // Payment gateway ID or Order ID
  description?: string;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { 
      type: String, 
      enum: ['deposit', 'withdrawal', 'buy_gold', 'sell_gold', 'refund'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'success', 'failed'], 
      default: 'pending' 
    },
    referenceId: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
