import cron from 'node-cron';
import axios from 'axios';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const HEALTH_CHECK_INTERVAL = '*/14 * * * *'; // Every 14 minutes

export const startHealthCheckScheduler = () => {
  console.log('🏥 Health check scheduler initialized');
  
  // Schedule health check every 14 minutes
  cron.schedule(HEALTH_CHECK_INTERVAL, async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/health`, {
        timeout: 10000, // 10 second timeout
      });
      
      console.log(`✅ Health check passed at ${new Date().toISOString()}:`, {
        status: response.status,
        data: response.data,
      });
    } catch (error: any) {
      console.error(`❌ Health check failed at ${new Date().toISOString()}:`, {
        message: error.message,
        code: error.code,
      });
    }
  });

  console.log(`✅ Health check scheduled to run every 14 minutes`);
};

// Optional: Add immediate health check on startup
export const runImmediateHealthCheck = async () => {
  console.log('🔄 Running immediate health check...');
  try {
    const response = await axios.get(`${SERVER_URL}/health`, {
      timeout: 10000,
    });
    console.log('✅ Immediate health check passed:', response.data);
  } catch (error: any) {
    console.error('❌ Immediate health check failed:', error.message);
  }
};