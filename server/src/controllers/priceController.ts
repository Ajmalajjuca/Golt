import { Request, Response } from 'express';
import Price, { IPrice } from '../models/Price.js';
import { PriceService } from '../services/priceService.js';

const priceService = new PriceService();

export class PriceController {
  /**
   * @desc Get current gold price
   * @route GET /api/prices/current
   * @access Public
   */
  async getCurrentPrice(req: Request, res: Response) {
    try {
      const currentPrice = priceService.getCurrentPriceInMemory();
      
      if (!currentPrice) {
        // If not in memory, fetch from DB
        const latestPrice = await priceService.getLatestPrice();
        if (!latestPrice) {
          return res.status(404).json({
            success: false,
            message: 'No price data available',
          });
        }

        return res.status(200).json({
          success: true,
          data: {
            buyPrice: latestPrice.buyPrice,
            sellPrice: latestPrice.sellPrice,
            timestamp: latestPrice.timestamp,
            currency: latestPrice.currency || 'INR',
          },
        });
      }

      // Return in-memory price with latest timestamp
      const latestPrice = await priceService.getLatestPrice();
      return res.status(200).json({
        success: true,
        data: {
          buyPrice: currentPrice.buy,
          sellPrice: currentPrice.sell,
          timestamp: latestPrice?.timestamp || new Date(),
          currency: 'INR',
        },
      });
    } catch (error: any) {
      console.error('Error fetching current price:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch current price',
        error: error.message,
      });
    }
  }

  /**
   * @desc Get price history with various time periods
   * @route GET /api/prices/history
   * @query period: 1H, 1D, 1W, 1M, 3M, 6M, 1Y, ALL
   * @query limit: number of records to return
   * @query interval: grouping interval (1m, 5m, 15m, 1h, 1d)
   * @access Public
   */
  async getPriceHistory(req: Request, res: Response) {
    try {
      const { period = '1D', limit, interval = 'auto' } = req.query;

      // Calculate time range based on period
      const timeRange = this.calculateTimeRange(period as string);
      
      // Build query
      const query: any = {
        timestamp: { $gte: timeRange.start },
      };

      if (timeRange.end) {
        query.timestamp.$lte = timeRange.end;
      }

      // Determine optimal interval if 'auto'
      const samplingInterval = interval === 'auto' 
        ? this.determineOptimalInterval(period as string)
        : interval;

      // Fetch prices with appropriate sampling
      let prices: IPrice[];
      
      if (samplingInterval === 'none') {
        // Return all data points
        prices = await Price.find(query)
          .sort({ timestamp: 1 })
          .limit(limit ? parseInt(limit as string) : 1000);
      } else {
        // Sample data at intervals
        prices = await this.samplePriceData(query, samplingInterval as string, limit as string);
      }

      // Calculate statistics
      const statistics = this.calculatePriceStatistics(prices);

      return res.status(200).json({
        success: true,
        data: {
          prices: prices.map(p => ({
            buyPrice: p.buyPrice,
            sellPrice: p.sellPrice,
            timestamp: p.timestamp,
            currency: p.currency || 'INR',
          })),
          statistics,
          period: period,
          interval: samplingInterval,
          count: prices.length,
        },
      });
    } catch (error: any) {
      console.error('Error fetching price history:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch price history',
        error: error.message,
      });
    }
  }

  /**
   * @desc Get price history for chart with optimized data points
   * @route GET /api/prices/chart
   * @query period: 1H, 1D, 1W, 1M, 3M, 6M, 1Y, ALL
   * @access Public
   */
  async getChartData(req: Request, res: Response) {
    try {
      const { period = '1D' } = req.query;

      const timeRange = this.calculateTimeRange(period as string);
      const query: any = {
        timestamp: { $gte: timeRange.start },
      };

      // Optimal number of data points for charts
      const targetPoints = 50;

      // Get total count
      const totalCount = await Price.countDocuments(query);
      
      // Calculate skip interval
      const skipInterval = Math.max(1, Math.floor(totalCount / targetPoints));

      // Fetch sampled data
      let prices = await Price.find(query)
        .sort({ timestamp: 1 });

      // Sample the data
      const sampledPrices = prices.filter((_, index) => index % skipInterval === 0);

      // Always include the latest price
      if (prices.length > 0 && sampledPrices[sampledPrices.length - 1]?._id?.toString() !== prices[prices.length - 1]._id?.toString()) {
        sampledPrices.push(prices[prices.length - 1]);
      }

      // Calculate change from first to last
      const firstPrice = sampledPrices[0];
      const lastPrice = sampledPrices[sampledPrices.length - 1];
      const change = lastPrice ? lastPrice.buyPrice - firstPrice.buyPrice : 0;
      const changePercent = firstPrice ? (change / firstPrice.buyPrice) * 100 : 0;

      return res.status(200).json({
        success: true,
        data: {
          prices: sampledPrices.map(p => ({
            buyPrice: p.buyPrice,
            sellPrice: p.sellPrice,
            timestamp: p.timestamp,
          })),
          summary: {
            currentPrice: lastPrice?.buyPrice || 0,
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            high: Math.max(...sampledPrices.map(p => p.buyPrice)),
            low: Math.min(...sampledPrices.map(p => p.buyPrice)),
            period: period,
          },
          count: sampledPrices.length,
        },
      });
    } catch (error: any) {
      console.error('Error fetching chart data:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch chart data',
        error: error.message,
      });
    }
  }

  /**
   * @desc Force refresh price from live API
   * @route POST /api/prices/refresh
   * @access Public
   */
  async refreshPrice(req: Request, res: Response) {
    try {
      const updatedPrice = await priceService.forceRefresh();

      return res.status(200).json({
        success: true,
        message: 'Price refreshed successfully',
        data: {
          buyPrice: updatedPrice.buyPrice,
          sellPrice: updatedPrice.sellPrice,
          timestamp: updatedPrice.timestamp,
          currency: updatedPrice.currency || 'INR',
        },
      });
    } catch (error: any) {
      console.error('Error refreshing price:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to refresh price',
        error: error.message,
      });
    }
  }

  /**
   * @desc Get price statistics for a time period
   * @route GET /api/prices/statistics
   * @query period: 1D, 1W, 1M, 3M, 6M, 1Y, ALL
   * @access Public
   */
  async getPriceStatistics(req: Request, res: Response) {
    try {
      const { period = '1D' } = req.query;

      const timeRange = this.calculateTimeRange(period as string);
      const query: any = {
        timestamp: { $gte: timeRange.start },
      };

      const prices = await Price.find(query).sort({ timestamp: 1 });

      if (prices.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No price data available for the specified period',
        });
      }

      const statistics = this.calculatePriceStatistics(prices);

      return res.status(200).json({
        success: true,
        data: {
          ...statistics,
          period: period,
          dataPoints: prices.length,
        },
      });
    } catch (error: any) {
      console.error('Error fetching price statistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch price statistics',
        error: error.message,
      });
    }
  }

  /**
   * @desc Get price comparison between different time periods
   * @route GET /api/prices/compare
   * @access Public
   */
  async comparePrices(req: Request, res: Response) {
    try {
      const currentPrice = await priceService.getLatestPrice();
      if (!currentPrice) {
        return res.status(404).json({
          success: false,
          message: 'No current price available',
        });
      }

      // Get prices at different time points
      const comparisons = await Promise.all([
        this.getPriceAtTime('1H'),
        this.getPriceAtTime('1D'),
        this.getPriceAtTime('1W'),
        this.getPriceAtTime('1M'),
        this.getPriceAtTime('3M'),
        this.getPriceAtTime('6M'),
        this.getPriceAtTime('1Y'),
      ]);

      const result = {
        current: {
          buyPrice: currentPrice.buyPrice,
          sellPrice: currentPrice.sellPrice,
          timestamp: currentPrice.timestamp,
        },
        comparisons: [
          {
            period: '1H',
            price: comparisons[0]?.buyPrice || null,
            change: comparisons[0] ? currentPrice.buyPrice - comparisons[0].buyPrice : null,
            changePercent: comparisons[0] ? ((currentPrice.buyPrice - comparisons[0].buyPrice) / comparisons[0].buyPrice) * 100 : null,
          },
          {
            period: '1D',
            price: comparisons[1]?.buyPrice || null,
            change: comparisons[1] ? currentPrice.buyPrice - comparisons[1].buyPrice : null,
            changePercent: comparisons[1] ? ((currentPrice.buyPrice - comparisons[1].buyPrice) / comparisons[1].buyPrice) * 100 : null,
          },
          {
            period: '1W',
            price: comparisons[2]?.buyPrice || null,
            change: comparisons[2] ? currentPrice.buyPrice - comparisons[2].buyPrice : null,
            changePercent: comparisons[2] ? ((currentPrice.buyPrice - comparisons[2].buyPrice) / comparisons[2].buyPrice) * 100 : null,
          },
          {
            period: '1M',
            price: comparisons[3]?.buyPrice || null,
            change: comparisons[3] ? currentPrice.buyPrice - comparisons[3].buyPrice : null,
            changePercent: comparisons[3] ? ((currentPrice.buyPrice - comparisons[3].buyPrice) / comparisons[3].buyPrice) * 100 : null,
          },
          {
            period: '3M',
            price: comparisons[4]?.buyPrice || null,
            change: comparisons[4] ? currentPrice.buyPrice - comparisons[4].buyPrice : null,
            changePercent: comparisons[4] ? ((currentPrice.buyPrice - comparisons[4].buyPrice) / comparisons[4].buyPrice) * 100 : null,
          },
          {
            period: '6M',
            price: comparisons[5]?.buyPrice || null,
            change: comparisons[5] ? currentPrice.buyPrice - comparisons[5].buyPrice : null,
            changePercent: comparisons[5] ? ((currentPrice.buyPrice - comparisons[5].buyPrice) / comparisons[5].buyPrice) * 100 : null,
          },
          {
            period: '1Y',
            price: comparisons[6]?.buyPrice || null,
            change: comparisons[6] ? currentPrice.buyPrice - comparisons[6].buyPrice : null,
            changePercent: comparisons[6] ? ((currentPrice.buyPrice - comparisons[6].buyPrice) / comparisons[6].buyPrice) * 100 : null,
          },
        ].filter(c => c.price !== null),
      };

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error comparing prices:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to compare prices',
        error: error.message,
      });
    }
  }

  // Helper Methods

  /**
   * Calculate time range based on period string
   */
  private calculateTimeRange(period: string): { start: Date; end?: Date } {
    const now = new Date();
    const start = new Date();

    switch (period.toUpperCase()) {
      case '1H':
        start.setHours(now.getHours() - 1);
        break;
      case '4H':
        start.setHours(now.getHours() - 4);
        break;
      case '1D':
        start.setDate(now.getDate() - 1);
        break;
      case '1W':
        start.setDate(now.getDate() - 7);
        break;
      case '2W':
        start.setDate(now.getDate() - 14);
        break;
      case '1M':
        start.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        start.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        start.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
        start.setFullYear(2000); // Get all historical data
        break;
      default:
        start.setDate(now.getDate() - 1); // Default to 1 day
    }

    return { start };
  }

  /**
   * Determine optimal sampling interval based on period
   */
  private determineOptimalInterval(period: string): string {
    switch (period.toUpperCase()) {
      case '1H':
      case '4H':
        return '1m'; // 1 minute intervals
      case '1D':
        return '5m'; // 5 minute intervals
      case '1W':
        return '1h'; // 1 hour intervals
      case '1M':
        return '4h'; // 4 hour intervals
      case '3M':
      case '6M':
        return '1d'; // 1 day intervals
      case '1Y':
      case 'ALL':
        return '1w'; // 1 week intervals
      default:
        return 'none';
    }
  }

  /**
   * Sample price data at specified intervals
   */
  private async samplePriceData(query: any, interval: string, limit?: string): Promise<IPrice[]> {
    const allPrices = await Price.find(query).sort({ timestamp: 1 });

    if (interval === 'none') {
      return limit ? allPrices.slice(0, parseInt(limit)) : allPrices;
    }

    const intervalMs = this.intervalToMilliseconds(interval);
    const sampledPrices: IPrice[] = [];
    let lastTimestamp = 0;

    for (const price of allPrices) {
      const currentTimestamp = new Date(price.timestamp).getTime();
      
      if (currentTimestamp - lastTimestamp >= intervalMs) {
        sampledPrices.push(price);
        lastTimestamp = currentTimestamp;
      }
    }

    // Always include the last price
    if (allPrices.length > 0 && sampledPrices[sampledPrices.length - 1]?._id?.toString() !== allPrices[allPrices.length - 1]._id?.toString()) {
      sampledPrices.push(allPrices[allPrices.length - 1]);
    }

    return limit ? sampledPrices.slice(0, parseInt(limit)) : sampledPrices;
  }

  /**
   * Convert interval string to milliseconds
   */
  private intervalToMilliseconds(interval: string): number {
    const value = parseInt(interval.slice(0, -1));
    const unit = interval.slice(-1);

    switch (unit) {
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      case 'w':
        return value * 7 * 24 * 60 * 60 * 1000;
      default:
        return 60 * 1000; // Default to 1 minute
    }
  }

  /**
   * Calculate comprehensive price statistics
   */
  private calculatePriceStatistics(prices: IPrice[]) {
    if (prices.length === 0) {
      return null;
    }

    const buyPrices = prices.map(p => p.buyPrice);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];

    const high = Math.max(...buyPrices);
    const low = Math.min(...buyPrices);
    const average = buyPrices.reduce((sum, price) => sum + price, 0) / buyPrices.length;
    const change = lastPrice.buyPrice - firstPrice.buyPrice;
    const changePercent = (change / firstPrice.buyPrice) * 100;

    // Calculate volatility (standard deviation)
    const variance = buyPrices.reduce((sum, price) => sum + Math.pow(price - average, 2), 0) / buyPrices.length;
    const volatility = Math.sqrt(variance);

    return {
      current: lastPrice.buyPrice,
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      average: parseFloat(average.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volatility: parseFloat(volatility.toFixed(2)),
      firstPrice: firstPrice.buyPrice,
      lastPrice: lastPrice.buyPrice,
      firstTimestamp: firstPrice.timestamp,
      lastTimestamp: lastPrice.timestamp,
    };
  }

  /**
   * Get price at a specific time in the past
   */
  private async getPriceAtTime(periodAgo: string): Promise<IPrice | null> {
    const timeRange = this.calculateTimeRange(periodAgo);
    
    return await Price.findOne({
      timestamp: { $lte: timeRange.start },
    }).sort({ timestamp: -1 });
  }
}

export default new PriceController();