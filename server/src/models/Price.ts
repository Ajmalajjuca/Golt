import mongoose, { Document, Schema } from 'mongoose';

export type MetalType = 'gold' | 'silver';
export interface IPrice extends Document {
  metalType: MetalType;
  buyPrice: number;
  sellPrice: number;
  currency: string;
  timestamp: Date;
}

const priceSchema = new Schema<IPrice>(
  {
    metalType: {
      type: String,
      required: true,
      enum: ['gold', 'silver'],
      default: 'gold'  // For backward compatibility
    },
    buyPrice: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for faster queries on timestamp
priceSchema.index({ metalType: 1, timestamp: -1 });

// Index for getting latest price of each metal


const Price = mongoose.model<IPrice>('Price', priceSchema);
export default Price;
