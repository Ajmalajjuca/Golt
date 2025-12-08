import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
  port: process.env.PORT || 5000,

  cors_origin: process.env.CORS_ORIGIN || "http://localhost:5173",

  jwt: {
    secret: process.env.JWT_SECRET || "default_secret_key",
    expire: process.env.JWT_EXPIRE || "7d",
  },

  db: {
    uri: process.env.MONGODB_URI || "",
  },

  nodeEnv: process.env.NODE_ENV || "development",

  LogLevel: process.env.LOG_LEVEL || "debug",

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },

};
