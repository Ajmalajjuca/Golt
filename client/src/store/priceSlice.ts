import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { priceService } from '../services';
import { 
  PriceData, 
  PriceHistoryData, 
  ChartData, 
  PriceComparisonData 
} from '../services';

// Enhanced Price State
export interface PriceState {
  // Current price
  current: PriceData | null;
  currentLoading: boolean;
  
  // Price history
  history: PriceHistoryData | null;
  historyLoading: boolean;
  
  // Chart data
  chartData: ChartData | null;
  chartLoading: boolean;
  selectedPeriod: string;
  
  // Statistics
  statistics: PriceHistoryData['statistics'] | null;
  statisticsLoading: boolean;
  
  // Price comparison
  comparison: PriceComparisonData | null;
  comparisonLoading: boolean;
  
  // Refresh state
  refreshing: boolean;
  lastRefreshTime: string | null;
  
  // Error handling
  error: string | null;
}

const initialState: PriceState = {
  current: null,
  currentLoading: false,
  
  history: null,
  historyLoading: false,
  
  chartData: null,
  chartLoading: false,
  selectedPeriod: '1D',
  
  statistics: null,
  statisticsLoading: false,
  
  comparison: null,
  comparisonLoading: false,
  
  refreshing: false,
  lastRefreshTime: null,
  
  error: null,
};

// Async Thunks

/**
 * Fetch current/live price
 */
export const fetchCurrentPrice = createAsyncThunk(
  'price/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await priceService.getCurrentPrice();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue('Failed to fetch current price');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch price');
    }
  }
);

/**
 * Fetch price history with flexible parameters
 */
export const fetchPriceHistory = createAsyncThunk(
  'price/fetchHistory',
  async (
    params: { period?: string; interval?: string; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const { period = '1D', interval, limit } = params;
      const response = await priceService.getPriceHistory(period, interval, limit);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue('Failed to fetch price history');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch history');
    }
  }
);

/**
 * Fetch optimized chart data
 */
export const fetchChartData = createAsyncThunk(
  'price/fetchChart',
  async (period: string = '1D', { rejectWithValue }) => {
    try {
      const response = await priceService.getChartData(period);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue('Failed to fetch chart data');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch chart data');
    }
  }
);

/**
 * Fetch price statistics
 */
export const fetchStatistics = createAsyncThunk(
  'price/fetchStatistics',
  async (period: string = '1D', { rejectWithValue }) => {
    try {
      const response = await priceService.getStatistics(period);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue('Failed to fetch statistics');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch statistics');
    }
  }
);

/**
 * Fetch price comparison across periods
 */
export const fetchPriceComparison = createAsyncThunk(
  'price/fetchComparison',
  async (_, { rejectWithValue }) => {
    try {
      const response = await priceService.comparePrices();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue('Failed to fetch price comparison');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch comparison');
    }
  }
);

/**
 * Force refresh price from API
 */
export const refreshPrice = createAsyncThunk(
  'price/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const response = await priceService.refreshPrice();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue('Failed to refresh price');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to refresh price');
    }
  }
);

/**
 * Legacy thunk for backward compatibility
 */
export const fetchLivePrice = createAsyncThunk(
  'price/fetchLive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await priceService.getCurrentPrice();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue('Failed to fetch price');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch price');
    }
  }
);

// Slice
const priceSlice = createSlice({
  name: 'price',
  initialState,
  reducers: {
    clearPriceError: (state) => {
      state.error = null;
    },
    
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    
    resetPriceState: (state) => {
      return initialState;
    },
    
    updateCurrentPrice: (state, action) => {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Current Price
    builder
      .addCase(fetchCurrentPrice.pending, (state) => {
        state.currentLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentPrice.fulfilled, (state, action) => {
        state.currentLoading = false;
        state.current = action.payload;
        state.lastRefreshTime = new Date().toISOString();
      })
      .addCase(fetchCurrentPrice.rejected, (state, action) => {
        state.currentLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Price History
    builder
      .addCase(fetchPriceHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchPriceHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchPriceHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Chart Data
    builder
      .addCase(fetchChartData.pending, (state) => {
        state.chartLoading = true;
        state.error = null;
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.chartLoading = false;
        state.chartData = action.payload;
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.chartLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Statistics
    builder
      .addCase(fetchStatistics.pending, (state) => {
        state.statisticsLoading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.statisticsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Price Comparison
    builder
      .addCase(fetchPriceComparison.pending, (state) => {
        state.comparisonLoading = true;
        state.error = null;
      })
      .addCase(fetchPriceComparison.fulfilled, (state, action) => {
        state.comparisonLoading = false;
        state.comparison = action.payload;
      })
      .addCase(fetchPriceComparison.rejected, (state, action) => {
        state.comparisonLoading = false;
        state.error = action.payload as string;
      });

    // Refresh Price
    builder
      .addCase(refreshPrice.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(refreshPrice.fulfilled, (state, action) => {
        state.refreshing = false;
        state.current = action.payload;
        state.lastRefreshTime = new Date().toISOString();
      })
      .addCase(refreshPrice.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload as string;
      });

    // Legacy: Fetch Live Price (backward compatibility)
    builder
      .addCase(fetchLivePrice.pending, (state) => {
        state.currentLoading = true;
        state.error = null;
      })
      .addCase(fetchLivePrice.fulfilled, (state, action) => {
        state.currentLoading = false;
        state.current = action.payload;
      })
      .addCase(fetchLivePrice.rejected, (state, action) => {
        state.currentLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearPriceError, 
  setSelectedPeriod, 
  resetPriceState,
  updateCurrentPrice 
} = priceSlice.actions;

export default priceSlice.reducer;