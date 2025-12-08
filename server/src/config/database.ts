import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.db.uri!);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
