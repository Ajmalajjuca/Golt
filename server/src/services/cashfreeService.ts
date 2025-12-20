import axios from "axios";
import { config } from "../config/config.js";

interface CashfreeOrderResponse {
  order_id: string;
  payment_session_id: string;
}

export class CashfreeService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    if (!config.cashfree?.clientId || !config.cashfree?.secret) {
      throw new Error("Cashfree API keys missing in config");
    }

    this.clientId = config.cashfree.clientId;
    this.clientSecret = config.cashfree.secret;
    this.baseUrl = config.cashfree.environment === "production"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

  }

  /**
   * @desc Create a Cashfree order
  */
  async createOrder(
    amount: number,
    customerId: string,
    customerPhone: string,
    customerEmail: string
  ): Promise<CashfreeOrderResponse> {
    try {
      console.log("✅ Cashfree initialized with base URL:", this.baseUrl);
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const payload = {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: customerId,
          customer_phone: customerPhone,
          customer_email: customerEmail || `${customerId}@example.com`,
          customer_name: "Customer", // Optional but recommended
        },
        order_meta: {
          return_url: `${"https://yourapp.com"}/payment-return?order_id=${orderId}`
        }
        
      };

      console.log("📦 Creating Cashfree order:", payload);

      const response = await axios.post(
        `${this.baseUrl}/orders`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-version": "2025-01-01",
            "x-client-id": this.clientId,
            "x-client-secret": this.clientSecret,
          },
        }
      );

      console.log("✅ Cashfree order created:", response.data);
      console.log("✅ Cashfree order created:", response.data.payment_session_id);

      return {
        order_id: response.data.order_id,
        payment_session_id: response.data.payment_session_id,
      };
    } catch (error: any) {
      console.error("❌ Cashfree order creation failed:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });

      throw new Error(
        error.response?.data?.message ||
        "Failed to create Cashfree order. Check your API credentials."
      );
    }
  }

  /**
   * @desc Fetch order status from Cashfree
   */
  async fetchOrder(orderId: string): Promise<any> {
    try {
      console.log("🔍 Fetching Cashfree order:", orderId);

      const response = await axios.get(
        `${this.baseUrl}/orders/${orderId}`,
        {
          headers: {
            "x-api-version": "2023-08-01",
            "x-client-id": this.clientId,
            "x-client-secret": this.clientSecret,
          },
        }
      );

      console.log("✅ Cashfree order fetched:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("❌ Cashfree order fetch failed:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      throw new Error(
        error.response?.data?.message ||
        "Failed to fetch Cashfree order"
      );
    }
  }

  /**
   * @desc Verify webhook signature (for production security)
   */
  verifyWebhookSignature(
    signature: string,
    timestamp: string,
    rawBody: string
  ): boolean {
    // TODO: Implement signature verification
    // Cashfree provides signature verification method
    return true;
  }
}
