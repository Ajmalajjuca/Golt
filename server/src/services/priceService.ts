import Price, { IPrice } from '../models/Price.js';
import axios from 'axios';

interface GoldPriceAPI {
  buyPriceUSD: number;
  sellPriceUSD: number;
  timestamp: Date;
}

export class PriceService {
  private currentPrice: { buy: number; sell: number } | null = null;
  private lastAPICall: Date | null = null;
  private apiCallInterval = 60000; // 1 minute between API calls
  private usdToInrRate = 83.5; // Update this periodically or fetch from exchange rate API

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Try to get latest price from DB first
    const latestPrice = await this.getLatestPrice();
    if (latestPrice) {
      this.currentPrice = { buy: latestPrice.buyPrice, sell: latestPrice.sellPrice };
    } else {
      // Fetch from API if DB is empty
      await this.fetchLivePrice();
    }
  }

  /**
   * @desc Get the latest price from DB
   */
  async getLatestPrice(): Promise<IPrice | null> {
    return await Price.findOne().sort({ timestamp: -1 });
  }

  /**
   * @desc Main method to update price - tries live API first, falls back to mock
   */
  async updatePrice(): Promise<IPrice> {
    try {
      // Check if we should call the API (rate limiting)
      const now = new Date();
      if (this.lastAPICall && (now.getTime() - this.lastAPICall.getTime()) < this.apiCallInterval) {
        // Too soon, use existing price with small fluctuation
        return await this.generateSmallFluctuation();
      }

      // Try to fetch live price
      const livePrice = await this.fetchLivePrice();
      if (livePrice) {
        return livePrice;
      }

      // Fallback to mock generation
      return await this.generateMockPrice();
    } catch (error) {
      console.error('Error updating price:', error);
      return await this.generateMockPrice();
    }
  }

  /**
   * @desc Fetch live gold price from API
   * Using multiple APIs with fallback
   */
  private async fetchLivePrice(): Promise<IPrice | null> {
    try {
      // Try primary API first
      let priceData = await this.fetchFromGoldAPI();
      
      if (!priceData) {
        // Fallback to secondary API
        priceData = await this.fetchFromMetalsLive();
      }

      if (!priceData) {
        // Fallback to tertiary API
        priceData = await this.fetchFromGoldPriceOrg();
      }

      if (!priceData) {
        return null;
      }

      // Update USD to INR rate periodically
      await this.updateExchangeRate();

      // Convert USD per troy ounce to INR per gram
      // 1 troy ounce = 31.1035 grams
      const buyPriceINR = Math.round((priceData.buyPriceUSD / 31.1035) * this.usdToInrRate);
      const sellPriceINR = Math.round((priceData.sellPriceUSD / 31.1035) * this.usdToInrRate);

      // Add Indian market spread (typically 2-3%)
      const spread = 0.025; // 2.5%
      const finalBuyPrice = Math.round(buyPriceINR * (1 + spread));
      const finalSellPrice = Math.round(sellPriceINR * (1 - spread));

      const priceEntry = await Price.create({
        buyPrice: finalBuyPrice,
        sellPrice: finalSellPrice,
        timestamp: new Date(),
      });

      this.currentPrice = { buy: finalBuyPrice, sell: finalSellPrice };
      this.lastAPICall = new Date();

      return priceEntry;
    } catch (error) {
      console.error('Error fetching live price:', error);
      return null;
    }
  }

  /**
   * @desc Fetch from GoldAPI.io (Primary - Most reliable)
   * Free tier: 100 requests/month
   * Sign up at: https://www.goldapi.io/
   */
  private async fetchFromGoldAPI(): Promise<GoldPriceAPI | null> {
    try {
      const API_KEY = process.env.GOLD_API_KEY;
      if (!API_KEY) return null;

      const response = await axios.get('https://www.goldapi.io/api/XAU/USD', {
        headers: {
          'x-access-token': API_KEY,
        },
        timeout: 10000,
      });

      if (response.data && response.data.price) {
        return {
          buyPriceUSD: response.data.price,
          sellPriceUSD: response.data.price * 0.98, // 2% spread
          timestamp: new Date(),
        };
      }

      return null;
    } catch (error) {
      console.error('GoldAPI error:', error);
      return null;
    }
  }

  /**
   * @desc Fetch from Metals.live API (Secondary - Free, no key required)
   * Documentation: https://metals.live/
   */
  private async fetchFromMetalsLive(): Promise<GoldPriceAPI | null> {
    try {
      const response = await axios.get('https://metals.live/v1/spot/gold', {
        timeout: 10000,
      });

      if (response.data && response.data.price) {
        const spotPrice = response.data.price;
        return {
          buyPriceUSD: spotPrice,
          sellPriceUSD: spotPrice * 0.98,
          timestamp: new Date(),
        };
      }

      return null;
    } catch (error) {
      console.error('Metals.live error:', error);
      return null;
    }
  }

  /**
   * @desc Fetch from GoldPrice.org API (Tertiary - Free)
   * Documentation: https://www.goldprice.org/gold-price-api.html
   */
  private async fetchFromGoldPriceOrg(): Promise<GoldPriceAPI | null> {
    try {
      const response = await axios.get('https://www.goldprice.org/gold-price-api.html/json', {
        timeout: 10000,
      });

      if (response.data && response.data.price) {
        const spotPrice = parseFloat(response.data.price);
        return {
          buyPriceUSD: spotPrice,
          sellPriceUSD: spotPrice * 0.98,
          timestamp: new Date(),
        };
      }

      return null;
    } catch (error) {
      console.error('GoldPrice.org error:', error);
      return null;
    }
  }

  /**
   * @desc Fetch from MetalsDevAPI (Alternative - Free)
   * Documentation: https://metals.dev/
   */
  private async fetchFromMetalsDevAPI(): Promise<GoldPriceAPI | null> {
    try {
      const API_KEY = process.env.METALS_DEV_API_KEY;
      if (!API_KEY) return null;

      const response = await axios.get('https://api.metals.dev/v1/latest', {
        params: {
          api_key: API_KEY,
          currency: 'USD',
          unit: 'toz', // troy ounce
        },
        timeout: 10000,
      });

      if (response.data && response.data.metals && response.data.metals.gold) {
        const goldPrice = response.data.metals.gold;
        return {
          buyPriceUSD: goldPrice,
          sellPriceUSD: goldPrice * 0.98,
          timestamp: new Date(),
        };
      }

      return null;
    } catch (error) {
      console.error('MetalsDevAPI error:', error);
      return null;
    }
  }

  /**
   * @desc Update USD to INR exchange rate
   * Using ExchangeRate-API (free tier: 1500 requests/month)
   */
  private async updateExchangeRate(): Promise<void> {
    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
        timeout: 5000,
      });

      if (response.data && response.data.rates && response.data.rates.INR) {
        this.usdToInrRate = response.data.rates.INR;
        console.log('Updated USD to INR rate:', this.usdToInrRate);
      }
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      // Keep using the last known rate
    }
  }

  /**
   * @desc Generate small fluctuation when API rate limit is hit
   */
  private async generateSmallFluctuation(): Promise<IPrice> {
    const lastPrice = this.currentPrice || { buy: 6500, sell: 6400 };
    
    // Very small fluctuation (±10 rupees) to simulate real-time movement
    const fluctuation = Math.floor(Math.random() * 21) - 10;
    
    const newBuy = lastPrice.buy + fluctuation;
    const newSell = lastPrice.sell + fluctuation;

    const priceEntry = await Price.create({
      buyPrice: newBuy,
      sellPrice: newSell,
      timestamp: new Date(),
    });

    this.currentPrice = { buy: newBuy, sell: newSell };
    return priceEntry;
  }

  /**
   * @desc Generate mock price (fallback when all APIs fail)
   */
  private async generateMockPrice(): Promise<IPrice> {
    const lastPrice = this.currentPrice || { buy: 6500, sell: 6400 };
    
    // Fluctuate by -50 to +50
    const fluctuation = Math.floor(Math.random() * 101) - 50;
    
    let newBuy = lastPrice.buy + fluctuation;
    // Ensure it doesn't drop too low or go too high
    if (newBuy < 5000) newBuy = 5000;
    if (newBuy > 8000) newBuy = 8000;

    // Sell price with spread
    const spread = 100 + Math.floor(Math.random() * 50);
    const newSell = newBuy - spread;

    const priceEntry = await Price.create({
      buyPrice: newBuy,
      sellPrice: newSell,
      timestamp: new Date(),
    });

    this.currentPrice = { buy: newBuy, sell: newSell };
    return priceEntry;
  }

  getCurrentPriceInMemory() {
    return this.currentPrice;
  }

  /**
   * @desc Get price history for charts
   */
  async getPriceHistory(hours: number = 24): Promise<IPrice[]> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    return await Price.find({
      timestamp: { $gte: cutoffTime },
    }).sort({ timestamp: 1 });
  }

  /**
   * @desc Force refresh from API (useful for manual refresh button)
   */
  async forceRefresh(): Promise<IPrice> {
    this.lastAPICall = null; // Reset rate limit
    return await this.updatePrice();
  }
}