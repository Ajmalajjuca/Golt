import { Request, Response } from 'express';
import { PriceAlert } from '../models/PriceAlert.js';
import User from '../models/User.js';
import { PriceService } from '../services/priceService.js';
import { z } from 'zod';

const createAlertSchema = z.object({
    metalType: z.enum(['gold', 'silver']),
    targetPrice: z.number().positive(),
    frequency: z.enum(['once', 'recurring']).optional(),
    pushToken: z.string().optional(),
});

export const AlertController = {
    // Create a new alert
    createAlert: async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const validatedData = createAlertSchema.parse(req.body);
            const userId = req.user._id;

            // Ensure user has the push token registered if provided
            if (validatedData.pushToken) {
                await User.findByIdAndUpdate(userId, {
                    $addToSet: { pushTokens: validatedData.pushToken }
                });
            }

            // Get current price to determine condition (above/below)
            const priceService = await PriceService.getInstance(validatedData.metalType);
            const currentPriceObj = await priceService.getEffectivePrice();
            const currentPrice = currentPriceObj.buyPrice; // Using buy price as reference

            const condition = validatedData.targetPrice > currentPrice ? 'above' : 'below';

            const alert = await PriceAlert.create({
                user: userId,
                metalType: validatedData.metalType,
                targetPrice: validatedData.targetPrice,
                condition,
                frequency: validatedData.frequency || 'once',
            });

            res.status(201).json({
                success: true,
                data: alert,
                message: `Alert set for ${validatedData.metalType} ${condition} ₹${validatedData.targetPrice}`
            });

        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
            }
            console.error('Error creating alert:', error);
            res.status(500).json({ success: false, message: 'Failed to create alert' });
        }
    },

    // Get user's alerts
    getAlerts: async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const alerts = await PriceAlert.find({
                user: req.user._id,
                status: 'active'
            })
                .sort({ createdAt: -1 });

            res.json({ success: true, data: alerts });
        } catch (error) {
            console.error('Error fetching alerts:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
        }
    },

    // Delete an alert
    deleteAlert: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await PriceAlert.findByIdAndDelete(id);
            res.json({ success: true, message: 'Alert deleted successfully' });
        } catch (error) {
            console.error('Error deleting alert:', error);
            res.status(500).json({ success: false, message: 'Failed to delete alert' });
        }
    }
};
