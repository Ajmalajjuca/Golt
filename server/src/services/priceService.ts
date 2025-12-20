import Price, { IPrice, MetalType } from "../models/Price.js";
import axios, { AxiosError } from "axios";

interface MetalPriceAPI {
  buyPriceUSD: number;
  sellPriceUSD: number;
  timestamp: Date;
}

interface PriceServiceConfig {
  apiCallInterval?: number;
  exchangeRateUpdateInterval?: number;
  defaultSpread?: number;
  minPriceGold?: number;
  maxPriceGold?: number;
  minPriceSilver?: number;
  maxPriceSilver?: number;
  cleanupDays?: number;
}

export class PriceService {
  private static instances: Map<MetalType, PriceService> = new Map();
  private currentPrice: { buy: number; sell: number } | null = null;
  private lastAPICall: Date | null = null;
  private lastExchangeRateUpdate: Date | null = null;
  private usdToInrRate = 90.17;
  private initPromise: Promise<void> | null = null;
  private updateMutex: Promise<IPrice> = Promise.resolve({} as IPrice);

  private readonly metalType: MetalType;

  // Configurable parameters
  private readonly config: Required<PriceServiceConfig> = {
    apiCallInterval: 60000, // 1 minute
    exchangeRateUpdateInterval: 3600000, // 1 hour
    defaultSpread: 0.025, // 2.5%
    minPriceGold: 3000,
    maxPriceGold: 15000,
    minPriceSilver: 40,   // Silver is cheaper per gram
    maxPriceSilver: 250,
    cleanupDays: 30,
  };

  private constructor(metalType: MetalType, config?: PriceServiceConfig) {
    this.metalType = metalType;
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * @desc Get singleton instance with proper initialization
   */
  static async getInstance(metalType: MetalType = "gold", config?: PriceServiceConfig): Promise<PriceService> {
    if (!PriceService.instances.has(metalType)) {
      const instance = new PriceService(metalType, config);
      await instance.initialize();
      PriceService.instances.set(metalType, instance);
    }
    return PriceService.instances.get(metalType)!;
  }

  /**
   * @desc Initialize service - load latest price or fetch from API
   */
  private async initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const latestPrice = await this.getLatestPrice();
        if (latestPrice) {
          this.currentPrice = {
            buy: latestPrice.buyPrice,
            sell: latestPrice.sellPrice,
          };
          this.log("Initialized with latest price from DB");
        } else {
          await this.fetchLivePrice();
          this.log("Initialized with fresh API price");
        }
      } catch (error) {
        this.logError("Initialization failed", error);
        // Set default fallback price
        this.currentPrice = this.getDefaultPrice();
      }
    })();

    return this.initPromise;
  }

  private getDefaultPrice(): { buy: number; sell: number } {
    if (this.metalType === 'gold') {
      return { buy: 12450, sell: 11605 };
    } else {
      return { buy: 95, sell: 90 }; // Silver default
    }
  }

  /**
   * @desc Get the latest price from DB
   */
  async getLatestPrice(): Promise<IPrice | null> {
    try {
      const price = await Price.findOne({ metalType: this.metalType }).sort({ timestamp: -1 }).exec();
      return price;
    } catch (error) {
      this.logError("Failed to get latest price from DB", error);
      return null;
    }
  }

  /**
   * @desc Main method to update price - thread-safe with mutex
   */
  async updatePrice(): Promise<IPrice> {
    // Use mutex to prevent concurrent updates
    this.updateMutex = this.updateMutex
      .then(() => this.executeUpdate())
      .catch(() => this.executeUpdate());
    return this.updateMutex;
  }


  /**
 * @desc Get base price for calculations (DB > Memory > Default)
 */
  private async getBasePrice(): Promise<{ buy: number; sell: number }> {
    const dbPrice = await this.getLatestPrice();
    if (dbPrice) {
      return {
        buy: dbPrice.buyPrice,
        sell: dbPrice.sellPrice
      };
    }

    if (this.currentPrice) {
      return this.currentPrice;
    }

    return this.getDefaultPrice();
  }

  /**
   * @desc Get effective price (Memory > DB > Default)
   * Guaranteed to return a valid price object
   */
  async getEffectivePrice(): Promise<{
    buyPrice: number;
    sellPrice: number;
    metalType: MetalType;
    timestamp: Date;
    currency: string;
    source: 'memory' | 'db' | 'default';
  }> {
    // 1. Try Memory
    if (this.currentPrice) {
      return {
        buyPrice: this.currentPrice.buy,
        sellPrice: this.currentPrice.sell,
        metalType: this.metalType,
        timestamp: new Date(),
        currency: 'INR',
        source: 'memory'
      };
    }

    // 2. Try DB
    const dbPrice = await this.getLatestPrice();
    if (dbPrice) {
      // Update memory while we're at it
      this.currentPrice = { buy: dbPrice.buyPrice, sell: dbPrice.sellPrice };
      return {
        buyPrice: dbPrice.buyPrice,
        sellPrice: dbPrice.sellPrice,
        metalType: this.metalType,
        timestamp: dbPrice.timestamp,
        currency: dbPrice.currency || 'INR',
        source: 'db'
      };
    }

    // 3. Fallback to Default
    const defaultPrice = this.getDefaultPrice();
    this.currentPrice = defaultPrice; // Initialize memory

    return {
      buyPrice: defaultPrice.buy,
      sellPrice: defaultPrice.sell,
      metalType: this.metalType,
      timestamp: new Date(),
      currency: 'INR',
      source: 'default'
    };
  }


  /**
   * @desc Internal update logic (protected by mutex)
   */
  private async executeUpdate(): Promise<IPrice> {
    try {
      const now = new Date();

      // Check if we should call the API (rate limiting)
      if (this.shouldUseCache(now)) {
        this.log("Using cached price (rate limit)");
        return this.returnCachedPrice();
      }

      // Try to fetch live price
      const livePrice = await this.fetchLivePrice();
      
      if (livePrice) {
        console.log('Live Price:',livePrice);
        return livePrice;
      }

      // Fallback to mock generation
      this.log("All APIs failed, using mock price");
      return await this.generateMockPrice();
    } catch (error) {
      this.logError("Error updating price", error);
      return await this.generateMockPrice();
    }
  }

  /**
   * @desc Check if we should use cached price
   */
  private shouldUseCache(now: Date): boolean {
    if (!this.lastAPICall) return false;
    return (
      now.getTime() - this.lastAPICall.getTime() < this.config.apiCallInterval
    );
  }

  /**
   * @desc Return cached price without creating new DB entry
   */
  private async returnCachedPrice(): Promise<IPrice> {
    const latestPrice = await this.getLatestPrice();
    if (latestPrice) {
      return latestPrice;
    }

    // If somehow no price in DB, generate one
    return await this.generateMockPrice();
  }

  /**
   * @desc Fetch live gold price from API with fallback chain
   */
  private async fetchLivePrice(): Promise<IPrice | null> {
    try {
      // Try APIs in order of reliability
      const apis = this.metalType === 'gold'
        ? this.getGoldAPIs()
        : this.getSilverAPIs();


      let priceData: MetalPriceAPI | null = null;

      for (const api of apis) {
        priceData = await api.fn();
        if (priceData) {
          this.log(`Successfully fetched from ${api.name}`);
          break;
        }
        this.log(`${api.name} failed, trying next...`);
      }

      if (!priceData) {
        this.log("All APIs failed");
        return null;
      }

      // Update exchange rate if needed
      await this.updateExchangeRateIfNeeded();

      // Convert and validate prices
      const { finalBuyPrice, finalSellPrice } =
        this.convertAndValidatePrice(priceData);

      // Create DB entry only for real API data
      const priceEntry = await Price.create({
        buyPrice: finalBuyPrice,
        sellPrice: finalSellPrice,
        timestamp: new Date(),
        metalType: this.metalType,
      });

      this.currentPrice = { buy: finalBuyPrice, sell: finalSellPrice };
      this.lastAPICall = new Date();

      return priceEntry;
    } catch (error) {
      this.logError("Error fetching live price", error);
      return null;
    }
  }


  private getGoldAPIs() {
    return [
      { name: 'GoldAPI', fn: () => this.fetchFromGoldAPI() },
      { name: 'Metals.live', fn: () => this.fetchFromMetalsLive('gold') },
      { name: 'MetalsDevAPI', fn: () => this.fetchFromMetalsDevAPI('gold') },
      { name: 'FreeGoldPrice', fn: () => this.freegoldprice() },
    ];
  }

  /**
   * @desc Get API sources for silver
   */
  private getSilverAPIs() {
    return [
      { name: 'SilverAPI', fn: () => this.fetchFromSilverAPI() },
      { name: 'Metals.live', fn: () => this.fetchFromMetalsLive('silver') },
      { name: 'MetalsDevAPI', fn: () => this.fetchFromMetalsDevAPI('silver') },
    ];
  }

  /**
   * @desc Convert USD to INR and apply spread with validation
   */
  private convertAndValidatePrice(priceData: MetalPriceAPI): {
    finalBuyPrice: number;
    finalSellPrice: number;
  } {
    // Convert USD per troy ounce to INR per gram
    // 1 troy ounce = 31.1035 grams
    const GRAMS_PER_TROY_OUNCE = 31.1035;

    let buyPriceINR = Math.round(
      (priceData.buyPriceUSD / GRAMS_PER_TROY_OUNCE) * this.usdToInrRate
    );
    let sellPriceINR = Math.round(
      (priceData.sellPriceUSD / GRAMS_PER_TROY_OUNCE) * this.usdToInrRate
    );

    // Validate prices are within reasonable range
    if (!this.isValidPrice(buyPriceINR)) {
      this.log(`Invalid buy price ${buyPriceINR}, using fallback`);
      buyPriceINR = 7000; // Reasonable fallback
    }

    if (!this.isValidPrice(sellPriceINR)) {
      this.log(`Invalid sell price ${sellPriceINR}, using fallback`);
      sellPriceINR = 6800; // Reasonable fallback
    }

    // Apply market spread
    const finalBuyPrice = Math.round(
      buyPriceINR * (1 + this.config.defaultSpread)
    );
    const finalSellPrice = Math.round(
      sellPriceINR * (1 - this.config.defaultSpread)
    );

    return { finalBuyPrice, finalSellPrice };
  }

  /**
   * @desc Validate price is within reasonable bounds
   */
  private isValidPrice(price: number): boolean {
    const minPrice = this.metalType === 'gold'
      ? this.config.minPriceGold
      : this.config.minPriceSilver;
    const maxPrice = this.metalType === 'gold'
      ? this.config.maxPriceGold
      : this.config.maxPriceSilver;

    return price >= minPrice &&
      price <= maxPrice &&
      !isNaN(price) &&
      isFinite(price);
  }

  /**
   * @desc Fetch from GoldAPI.io
   */
  private async fetchFromGoldAPI(): Promise<MetalPriceAPI | null> {
    try {
      const API_KEY = process.env.GOLD_API_KEY;
      if (!API_KEY) {
        this.log("GOLD_API_KEY not configured");
        return null;
      }

      const response = await axios.get("https://www.goldapi.io/api/XAU/USD", {
        headers: { "x-access-token": API_KEY },
        timeout: 10000,
      });

      if (response.data?.price) {
        return {
          buyPriceUSD: response.data.price,
          sellPriceUSD: response.data.price * 0.98,
          timestamp: new Date(),
        };
      }

      return null;
    } catch (error) {
      this.logError("GoldAPI error", error);
      return null;
    }
  }


  /**
   * @desc Fetch from SilverAPI (Silver only)
   */
  private async fetchFromSilverAPI(): Promise<MetalPriceAPI | null> {
    try {
      const API_KEY = process.env.GOLD_API_KEY; // Same API key works for silver
      if (!API_KEY) {
        this.log('GOLD_API_KEY not configured');
        return null;
      }

      const response = await axios.get('https://www.goldapi.io/api/XAG/USD', {
        headers: { 'x-access-token': API_KEY },
        timeout: 10000,
      });

      console.log("response.data?.price:",response.data?.price);
      

      if (response.data?.price) {
        return {
          buyPriceUSD: response.data.price,
          sellPriceUSD: response.data.price * 0.98,
          timestamp: new Date(),
        };
      }

      return null;
    } catch (error) {
      this.logError('SilverAPI error', error);
      return null;
    }
  }


  /**
   * @desc Fetch from Metals.live API
   */
  private async fetchFromMetalsLive(metal: MetalType): Promise<MetalPriceAPI | null> {
    try {
      const response = await axios.get(`https://metals.live/v1/spot/${metal}`, {
        timeout: 10000,
      });

      if (response.data?.price) {
        const spotPrice = response.data.price;
        return {
          buyPriceUSD: spotPrice,
          sellPriceUSD: spotPrice * 0.98,
          timestamp: new Date(),
        };
      }

      return null;
    } catch (error) {
      this.logError("Metals.live error", error);
      return null;
    }
  }

  /**
   * @desc Fetch from FreeGoldPrice API
   */
  private async freegoldprice(): Promise<MetalPriceAPI | null> {
    try {
      const API_KEY = process.env.FREEGOLDPRICE_API_KEY;
      if (!API_KEY) {
        this.log("FREEGOLDPRICE_API_KEY not configured");
        return null;
      }

      const response = await axios.get(
        `https://freegoldprice.org/api/v2?key=${API_KEY}&action=GSJ`,
        { timeout: 10000 }
      );

      const goldAsk = response.data?.GSJ?.Gold?.USD?.ask;

      if (!goldAsk) {
        this.log("Unexpected FreeGoldPrice API response format");
        return null;
      }

      return {
        buyPriceUSD: parseFloat(goldAsk),
        sellPriceUSD: parseFloat(goldAsk) * 0.98,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logError("FreeGoldPrice API error", error);
      return null;
    }
  }

  /**
   * @desc Fetch from MetalsDevAPI
   */
  private async fetchFromMetalsDevAPI(metal: MetalType): Promise<MetalPriceAPI | null> {
    try {
      const API_KEY = process.env.METALS_DEV_API_KEY;
      if (!API_KEY) {
        this.log("METALS_DEV_API_KEY not configured");
        return null;
      }

      const response = await axios.get("https://api.metals.dev/v1/latest", {
        params: {
          api_key: API_KEY,
          currency: "USD",
          unit: "toz",
        },
        timeout: 10000,
      });

      const goldPrice = response.data?.metals?.[metal];

      if (!goldPrice) {
        this.log("Unexpected MetalsDevAPI response format");
        return null;
      }

      return {
        buyPriceUSD: goldPrice,
        sellPriceUSD: goldPrice * 0.98,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logError("MetalsDevAPI error", error);
      return null;
    }
  }

  /**
   * @desc Update exchange rate only if cache expired
   */
  private async updateExchangeRateIfNeeded(): Promise<void> {
    const now = new Date();

    // Check if we need to update (1 hour cache)
    if (
      this.lastExchangeRateUpdate &&
      now.getTime() - this.lastExchangeRateUpdate.getTime() <
      this.config.exchangeRateUpdateInterval
    ) {
      return;
    }

    try {
      const response = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/USD",
        { timeout: 5000 }
      );

      if (response.data?.rates?.INR) {
        this.usdToInrRate = response.data.rates.INR;
        this.lastExchangeRateUpdate = now;
        this.log(`Updated USD to INR rate: ${this.usdToInrRate}`);
      }
    } catch (error) {
      this.logError("Error updating exchange rate", error);
      // Keep using last known rate
    }
  }


  /**
   * @desc Generate mock price when all APIs fail
   */
  private async generateMockPrice(): Promise<IPrice> {
    const basePrice = await this.getBasePrice();

    // Fluctuation based on metal type
    const fluctuationRange = this.metalType === 'gold' ? 50 : 2;
    const fluctuation = Math.floor(Math.random() * (fluctuationRange * 2 + 1)) - fluctuationRange;

    let newBuy = basePrice.buy + fluctuation;

    // Ensure reasonable bounds
    const minPrice = this.metalType === 'gold'
      ? this.config.minPriceGold * 3.5
      : this.config.minPriceSilver * 2;
    const maxPrice = this.metalType === 'gold'
      ? this.config.maxPriceGold * 0.97
      : this.config.maxPriceSilver * 0.95;

    newBuy = Math.max(minPrice, Math.min(maxPrice, newBuy));

    // Maintain reasonable spread
    const spreadRange = this.metalType === 'gold' ? 500 : 5;
    const spread = spreadRange + Math.floor(Math.random() * (spreadRange / 10));
    const newSell = newBuy - spread;

    const priceEntry = await Price.create({
      metalType: this.metalType,
      buyPrice: newBuy,
      sellPrice: newSell,
      timestamp: new Date(),
    });

    this.currentPrice = { buy: newBuy, sell: newSell };
    return priceEntry;
  }

  /**
   * @desc Get current price from memory (no DB call)
   */
  getCurrentPriceInMemory(): { buy: number; sell: number } | null {
    return this.currentPrice;
  }

  /**
   * @desc Get price history for charts with validation
   */
  async getPriceHistory(hours: number = 24): Promise<IPrice[]> {
    // Validate input
    if (hours <= 0 || hours > 720) {
      // Max 30 days
      throw new Error("Hours must be between 1 and 720");
    }

    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hours);

      return await Price.find({
        timestamp: { $gte: cutoffTime },
      }).sort({ timestamp: 1 });
    } catch (error) {
      this.logError("Error fetching price history", error);
      return [];
    }
  }

  /**
   * @desc Force refresh from API (bypasses rate limit)
   */
  async forceRefresh(): Promise<IPrice> {
    this.lastAPICall = null;
    return await this.updatePrice();
  }

  /**
   * @desc Cleanup old price records
   */
  async cleanupOldPrices(): Promise<{ deletedCount: number }> {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - this.config.cleanupDays);

      const result = await Price.deleteMany({
        metalType: this.metalType,
        timestamp: { $lt: cutoff },
      });

      this.log(`Cleaned up ${result.deletedCount} old ${this.metalType} price records`);
      return { deletedCount: result.deletedCount || 0 };
    } catch (error) {
      this.logError("Error cleaning up old prices", error);
      return { deletedCount: 0 };
    }
  }

  /**
   * @desc Get service statistics
   */
  getStats() {
    return {
      metalType: this.metalType,
      currentPrice: this.currentPrice,
      lastAPICall: this.lastAPICall,
      lastExchangeRateUpdate: this.lastExchangeRateUpdate,
      usdToInrRate: this.usdToInrRate,
      config: this.config,
    };
  }

  /**
   * @desc Structured logging
   */
  private log(message: string, data?: any) {
    console.log(`[PriceService] ${message}`, data || "");
  }

  /**
   * @desc Error logging with safe extraction
   */
  private logError(message: string, error: unknown) {
    const errorMessage = this.extractErrorMessage(error);
    console.error(`[PriceService] ${message}:`, errorMessage);
  }

  /**
   * @desc Safely extract error message
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (axios.isAxiosError(error)) {
      return (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message
      );
    }
    return String(error);
  }
}

// Export singleton getter for convenience
export const getGoldPriceService = () => PriceService.getInstance('gold');
export const getSilverPriceService = () => PriceService.getInstance('silver');