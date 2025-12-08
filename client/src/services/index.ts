import api from './api';
import { ApiResponse, User } from '../types';

// Add these types for price service
export interface PriceData {
  buyPrice: number;
  sellPrice: number;
  timestamp: string;
  currency: string;
}

export interface PriceHistoryData {
  prices: PriceData[];
  statistics: {
    current: number;
    high: number;
    low: number;
    average: number;
    change: number;
    changePercent: number;
    volatility: number;
    firstPrice: number;
    lastPrice: number;
    firstTimestamp: string;
    lastTimestamp: string;
  };
  period: string;
  interval: string;
  count: number;
}

export interface ChartData {
  prices: PriceData[];
  summary: {
    currentPrice: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    period: string;
  };
  count: number;
}

export interface PriceComparison {
  period: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
}

export interface PriceComparisonData {
  current: {
    buyPrice: number;
    sellPrice: number;
    timestamp: string;
  };
  comparisons: PriceComparison[];
}

export const authService = {
  register: async (name: string, email: string, password: string, phone: string) => {
    return api.post<any, ApiResponse<{ user: User; token: string }>>('/auth/register', {
      name,
      email,
      password,
      phone,
    });
  },

  login: async (email: string, password: string) => {
    return api.post<any, ApiResponse<{ user: User; token: string }>>('/auth/login', {
      email,
      password,
    });
  },

  googleLogin: async (idToken: string) => {
    return api.post<any, ApiResponse<{ user: User; token: string }>>('/auth/google', {
      idToken,
    });
  },

  getProfile: async () => {
    return api.get<any, ApiResponse<User>>('/users/me');
  },
};

export const priceService = {
  /**
   * Get current/live gold price
   * @returns Current buy and sell prices
   */
  getCurrentPrice: async () => {
    return api.get<any, ApiResponse<PriceData>>('/price/current');
  },

  /**
   * Get price history with flexible time periods
   * @param period - Time period: 1H, 4H, 1D, 1W, 2W, 1M, 3M, 6M, 1Y, ALL
   * @param interval - Optional: Sampling interval (1m, 5m, 15m, 1h, 1d, auto)
   * @param limit - Optional: Maximum number of records
   * @returns Price history with statistics
   */
  getPriceHistory: async (
    period: string = '1D',
    interval?: string,
    limit?: number
  ) => {
    const params = new URLSearchParams({ period });
    if (interval) params.append('interval', interval);
    if (limit) params.append('limit', limit.toString());
    
    return api.get<any, ApiResponse<PriceHistoryData>>(
      `/price/history?${params.toString()}`
    );
  },

  /**
   * Get optimized chart data (max 50 points for smooth rendering)
   * @param period - Time period: 1H, 4H, 1D, 1W, 1M, 3M, 6M, 1Y, ALL
   * @returns Optimized price data for charts
   */
  getChartData: async (period: string = '1D') => {
    return api.get<any, ApiResponse<ChartData>>(
      `/price/chart?period=${period}`
    );
  },

  /**
   * Get price statistics for a time period
   * @param period - Time period: 1D, 1W, 1M, 3M, 6M, 1Y, ALL
   * @returns Comprehensive price statistics
   */
  getStatistics: async (period: string = '1D') => {
    return api.get<any, ApiResponse<PriceHistoryData['statistics'] & { period: string; dataPoints: number }>>(
      `/price/statistics?period=${period}`
    );
  },

  /**
   * Compare current price with historical prices across multiple periods
   * @returns Price comparisons for 1H, 1D, 1W, 1M, 3M, 6M, 1Y
   */
  comparePrices: async () => {
    return api.get<any, ApiResponse<PriceComparisonData>>(
      '/price/compare'
    );
  },

  /**
   * Force refresh price from live API
   * @returns Updated price data
   */
  refreshPrice: async () => {
    return api.post<any, ApiResponse<PriceData>>('/price/refresh');
  },

  // Legacy methods for backward compatibility
  getLivePrice: async () => {
    return priceService.getCurrentPrice();
  },
};

export const kycService = {
  submitKYC: async (panNumber: string, aadhaarNumber: string) => {
    return api.post('/kyc/submit', { panNumber, aadhaarNumber });
  },

  getKYCStatus: async () => {
    return api.get('/kyc/status');
  },
};

export const orderService = {
  initiateBuy: async (amount: number) => {
    return api.post('/orders/buy', { amount });
  },

  verifyPayment: async (orderId: string, razorpayPaymentId: string, razorpaySignature: string) => {
    return api.post('/orders/verify-payment', {
      orderId,
      razorpayPaymentId,
      razorpaySignature,
    });
  },

  initiateSell: async (goldGrams: number) => {
    return api.post('/orders/sell', { goldGrams });
  },

  getOrders: async (limit: number = 50) => {
    return api.get(`/orders?limit=${limit}`);
  },

  getOrderById: async (id: string) => {
    return api.get(`/orders/${id}`);
  },
};

export const walletService = {
  getWallet: async () => {
    return api.get('/wallet');
  },

  getTransactions: async (page: number = 1, limit: number = 50) => {
    return api.get(`/wallet/transactions?page=${page}&limit=${limit}`);
  },
};