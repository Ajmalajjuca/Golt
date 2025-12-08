// schedulers/priceScheduler.ts
import cron from 'node-cron';
import { PriceService } from '../services/priceService.js';

const priceService = new PriceService();

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
      if (hour >= 9 && hour < 23.5 && day !== 0) {
        await priceService.updatePrice();
        console.log('Price updated:', priceService.getCurrentPriceInMemory());
      }
    } catch (error) {
      console.error('Error in price scheduler:', error);
    }
  });

  console.log('Price scheduler started');
};