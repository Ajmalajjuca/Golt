import { PriceAlert } from '../models/PriceAlert.js';
import { PushNotificationService } from './pushNotificationService.js';

export class AlertService {
    /**
     * Check if any active alerts are triggered by current prices
     */
    static async checkAlerts(goldPrice: number, silverPrice: number): Promise<void> {
        try {
            // Find all active alerts
            const alerts = await PriceAlert.find({ status: 'active', isActive: true });

            if (alerts.length === 0) return;

            for (const alert of alerts) {
                const currentPrice = alert.metalType === 'gold' ? goldPrice : silverPrice;
                let triggered = false;

                if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
                    triggered = true;
                } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
                    triggered = true;
                }

                if (triggered) {
                    // Send notification
                    const title = `Price Alert: ${alert.metalType.toUpperCase()}`;
                    const body = `${alert.metalType.charAt(0).toUpperCase() + alert.metalType.slice(1)} price is now ${alert.condition === 'above' ? 'above' : 'below'} ₹${alert.targetPrice}. Current: ₹${currentPrice}`;

                    await PushNotificationService.sendToUser(
                        alert.user.toString(),
                        title,
                        body,
                        { alertId: alert._id, metalType: alert.metalType, price: currentPrice }
                    );

                    // Update alert status
                    if (alert.frequency === 'once') {
                        alert.status = 'triggered';
                        alert.isActive = false;
                        alert.triggeredAt = new Date();
                        await alert.save();
                    } else {
                        // For recurring, maybe update triggeredAt to avoid spamming every minute?
                        // For now simpler logic: Just save triggeredAt. 
                        // Real recurring system needs cooldown logic.
                        // We'll implement a simple 1 hour cooldown by checking triggeredAt.
                        if (!alert.triggeredAt || (new Date().getTime() - new Date(alert.triggeredAt).getTime()) > 60 * 60 * 1000) {
                            alert.triggeredAt = new Date();
                            await alert.save();
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error checking price alerts:', error);
        }
    }
}
