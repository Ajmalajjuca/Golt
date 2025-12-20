import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceAlert extends Document {
    user: mongoose.Types.ObjectId;
    metalType: 'gold' | 'silver';
    targetPrice: number;
    condition: 'above' | 'below';
    frequency: 'once' | 'recurring';
    status: 'active' | 'triggered' | 'cancelled';
    isActive: boolean;
    createdAt: Date;
    triggeredAt?: Date;
}

const PriceAlertSchema = new Schema<IPriceAlert>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        metalType: {
            type: String,
            enum: ['gold', 'silver'],
            required: true,
        },
        targetPrice: {
            type: Number,
            required: true,
        },
        condition: {
            type: String,
            enum: ['above', 'below'],
            required: true,
        },
        frequency: {
            type: String,
            enum: ['once', 'recurring'],
            default: 'once',
        },
        status: {
            type: String,
            enum: ['active', 'triggered', 'cancelled'],
            default: 'active',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        triggeredAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries during price updates
PriceAlertSchema.index({ user: 1 });
PriceAlertSchema.index({ status: 1, metalType: 1 });
PriceAlertSchema.index({ isActive: 1 });

export const PriceAlert = mongoose.model<IPriceAlert>('PriceAlert', PriceAlertSchema);
