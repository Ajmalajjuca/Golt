import mongoose, { Document, Schema } from 'mongoose';

export interface IPrice extends Document {
  buyPrice: number;
  sellPrice: number;
  currency: string;
  timestamp: Date;
}

const priceSchema = new Schema<IPrice>(
  {
    buyPrice: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for faster queries on timestamp
priceSchema.index({ timestamp: -1 });

const Price = mongoose.model<IPrice>('Price', priceSchema);
export default Price;
