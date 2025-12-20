export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  goldBalance: number;
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  role: 'user' | 'admin';
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Price {
  _id: string;
  buyPrice: number;
  sellPrice: number;
  currency: string;
  timestamp: string;
}

export interface PriceState {
  current: Price | null;
  history: Price[];
  loading: boolean;
  error: string | null;
}

export interface Order {
  _id: string;
  user: string;
  type: 'buy' | 'sell';
  amountInr: number;
  goldGrams: number;
  pricePerGram: number;
  status: 'pending' | 'payment_pending' | 'completed' | 'failed' | 'cancelled';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  providerOrderId?: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Transaction {
  _id: string;
  user: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'buy_gold' | 'sell_gold' | 'buy_silver' | 'sell_silver' | 'refund';
  status: 'pending' | 'success' | 'failed';
  referenceId?: string;
  description?: string;
  createdAt: string;
}

export interface WalletData {
  walletBalance: number;
  goldBalance: number;
  goldValue: number;
  silverBalance: number;
  silverValue: number;
  totalInvested: number;
  avgBuyPrice?: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export interface KYC {
  _id: string;
  user: string;
  panNumber: string;
  aadhaarNumber: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}
