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
   * Get current/live gold/silver price
   * @param metalType - 'gold' | 'silver' (default: 'gold')
   * @returns Current buy and sell prices
   */
  getCurrentPrice: async (metalType: 'gold' | 'silver' = 'gold') => {
    return api.get<any, ApiResponse<PriceData>>(`/price/current/${metalType}`);
  },

  /**
   * Get price history with flexible time periods
   * @param period - Time period: 1H, 4H, 1D, 1W, 2W, 1M, 3M, 6M, 1Y, ALL
   * @param metalType - 'gold' | 'silver' (default: 'gold')
   * @param interval - Optional: Sampling interval (1m, 5m, 15m, 1h, 1d, auto)
   * @param limit - Optional: Maximum number of records
   * @returns Price history with statistics
   */
  getPriceHistory: async (
    period: string = '1D',
    metalType: 'gold' | 'silver' = 'gold',
    interval?: string,
    limit?: number
  ) => {
    const params = new URLSearchParams({ period });
    if (interval) params.append('interval', interval);
    if (limit) params.append('limit', limit.toString());

    return api.get<any, ApiResponse<PriceHistoryData>>(
      `/price/history/${metalType}?${params.toString()}`
    );
  },

  /**
   * Get optimized chart data (max 50 points for smooth rendering)
   * @param period - Time period: 1H, 4H, 1D, 1W, 1M, 3M, 6M, 1Y, ALL
   * @param metalType - 'gold' | 'silver' (default: 'gold')
   * @returns Optimized price data for charts
   */
  getChartData: async (period: string = '1D', metalType: 'gold' | 'silver' = 'gold') => {
    return api.get<any, ApiResponse<ChartData>>(
      `/price/chart/${metalType}?period=${period}`
    );
  },

  /**
   * Get price statistics for a time period
   * @param period - Time period: 1D, 1W, 1M, 3M, 6M, 1Y, ALL
   * @param metalType - 'gold' | 'silver' (default: 'gold')
   * @returns Comprehensive price statistics
   */
  getStatistics: async (period: string = '1D', metalType: 'gold' | 'silver' = 'gold') => {
    return api.get<any, ApiResponse<PriceHistoryData['statistics'] & { period: string; dataPoints: number }>>(
      `/price/statistics/${metalType}?period=${period}`
    );
  },

  /**
   * Compare current price with historical prices across multiple periods
   * @param metalType - 'gold' | 'silver' (default: 'gold')
   * @returns Price comparisons for 1H, 1D, 1W, 1M, 3M, 6M, 1Y
   */
  comparePrices: async (metalType: 'gold' | 'silver' = 'gold') => {
    return api.get<any, ApiResponse<PriceComparisonData>>(
      `/price/compare/${metalType}`
    );
  },

  /**
   * Force refresh price from live API
   * @param metalType - 'gold' | 'silver' (default: 'gold')
   * @returns Updated price data
   */
  refreshPrice: async (metalType: 'gold' | 'silver' = 'gold') => {
    return api.post<any, ApiResponse<PriceData>>(`/price/refresh/${metalType}`);
  },

  // Legacy methods for backward compatibility
  getLivePrice: async (metalType: 'gold' | 'silver' = 'gold') => {
    return priceService.getCurrentPrice(metalType);
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
  initiateBuy: async (amount: number, metalType: 'gold' | 'silver' = 'gold') => {
    return api.post('/orders/buy', { amount, metalType });
  },

  verifyPayment: async (orderId: string) => {
    return api.post('/orders/verify-payment', {
      orderId,
    });
  },

  initiateSell: async (quantity: number, metalType: 'gold' | 'silver' = 'gold') => {
    return api.post('/orders/sell', { quantity, metalType });
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