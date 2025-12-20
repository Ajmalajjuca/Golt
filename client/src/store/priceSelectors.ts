import { RootState } from '../store';

// Current price selectors
export const selectCurrentPrice = (state: RootState) => state.price.current;
export const selectCurrentLoading = (state: RootState) => state.price.currentLoading;

// History selectors
export const selectPriceHistory = (state: RootState) => state.price.history;
export const selectHistoryLoading = (state: RootState) => state.price.historyLoading;

// Chart selectors
export const selectChartData = (state: RootState) => state.price.chartData;
export const selectChartLoading = (state: RootState) => state.price.chartLoading;
export const selectSelectedPeriod = (state: RootState) => state.price.selectedPeriod;
export const selectMetalType = (state: RootState) => state.price.metalType;

// Statistics selectors
export const selectStatistics = (state: RootState) => state.price.statistics;
export const selectStatisticsLoading = (state: RootState) => state.price.statisticsLoading;

// Comparison selectors
export const selectPriceComparison = (state: RootState) => state.price.comparison;
export const selectComparisonLoading = (state: RootState) => state.price.comparisonLoading;

// Refresh selectors
export const selectRefreshing = (state: RootState) => state.price.refreshing;
export const selectLastRefreshTime = (state: RootState) => state.price.lastRefreshTime;

// Error selector
export const selectPriceError = (state: RootState) => state.price.error;

// Computed selectors
export const selectBuyPrice = (state: RootState) => state.price.current?.buyPrice || 0;
export const selectSellPrice = (state: RootState) => state.price.current?.sellPrice || 0;

export const selectPriceChange = (state: RootState) => {
  const stats = state.price.statistics;
  if (!stats) return { change: 0, changePercent: 0 };
  return {
    change: stats.change,
    changePercent: stats.changePercent,
  };
};