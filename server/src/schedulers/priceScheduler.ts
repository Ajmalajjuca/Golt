// schedulers/priceScheduler.ts
import cron from 'node-cron';
import { getGoldPriceService, getSilverPriceService } from '../services/priceService.js';
import { AlertService } from '../services/alertService.js';

// Update price every minute during market hours
// Indian gold market: 9 AM to 11:30 PM IST (Mon-Sat)
export const startPriceScheduler = () => {
  // Every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();

      // Check if within market hours (9 AM - 11:30 PM) and not Sunday
      // Note: Crypto/International markets are 24/7, but we stick to this schedule for now
      if (hour >= 9 && hour < 23.5 && day !== 0) {
        const goldService = await getGoldPriceService();
        const silverService = await getSilverPriceService();

        const [goldPrice, silverPrice] = await Promise.all([
          goldService.updatePrice(),
          silverService.updatePrice()
        ]);

        console.log('Prices updated');

        // Log prices
        console.log('Gold price:', goldPrice.buyPrice);
        console.log('Silver price:', silverPrice.buyPrice);

        // Check for alerts
        await AlertService.checkAlerts(goldPrice.buyPrice, silverPrice.buyPrice);
      }
    } catch (error) {
      console.error('Error in price scheduler:', error);
    }
  });

  console.log('Price scheduler started');
};