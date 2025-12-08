import mongoose from 'mongoose';
import { config } from '../config/config.js';

/**
 * Check if database is connected
 * @returns boolean - true if connected, false otherwise
 */
export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get database connection status
 * @returns string - human-readable connection state
 */
export const getConnectionStatus = (): string => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Close database connection
 */
export const closeConnection = async (): Promise<void> => {
  await mongoose.connection.close();
};

/**
 * Clear all collections in the database (useful for testing)
 */
export const clearDatabase = async (): Promise<void> => {
  if (config.nodeEnv === 'test') {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      if (Object.prototype.hasOwnProperty.call(collections, key)) {
        await collections[key].deleteMany({});
      }
    }
  }
};
