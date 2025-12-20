# 🏆 GoldVault - Digital Gold Trading Platform

A complete digital gold buying and selling application built with **React Native (Expo)** and **Node.js**, similar to Jar/SafeGold/Augmont.

---

## 📱 Features

### User Features
- ✅ **Authentication** - Register, Login with JWT
- ✅ **Live Gold Prices** - Real-time buy/sell prices with auto-refresh (20s)
- ✅ **KYC Verification** - PAN + Aadhaar submission with mock verification
- ✅ **Buy Gold** - Purchase gold with Cashfree integration (mocked)
- ✅ **Sell Gold** - Sell gold instantly
- ✅ **Digital Wallet** - Track cash and gold balance
- ✅ **Portfolio** - View total wealth, P&L, average buy price
- ✅ **Transaction History** - Complete ledger of all transactions
- ✅ **Order Management** - Track all buy/sell orders

### Technical Features
- 🔐 JWT Authentication
- 💳 CashFree Payment Integration (Mock)
- 📊 Real-time price updates
- 🎨 Modern UI with Tailwind CSS (NativeWind)
- 🔄 Redux Toolkit for state management
- 📱 Responsive design
- 🚀 TypeScript throughout

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Styling**: NativeWind (Tailwind CSS)
- **HTTP Client**: Axios
- **Storage**: AsyncStorage

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Built-in
- **Payment**: CashFree (Mock)

---

## 📁 Project Structure

```
gold/
├── client/                 # React Native (Expo) Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── screens/       # App screens
│   │   ├── navigation/    # Navigation setup
│   │   ├── store/         # Redux store & slices
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   ├── constants/     # App constants
│   │   └── utils/         # Utility functions
│   ├── App.tsx
│   └── package.json
│
├── server/                # Node.js Backend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utility functions
│   │   ├── app.ts        # Express app setup
│   │   └── server.ts     # Server entry point
│   ├── API_DOCUMENTATION.md
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Expo CLI
- Android Studio / Xcode (for mobile testing)

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/goldvault
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:19000
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update API URL**
   
   Edit `client/src/constants/index.ts`:
   ```typescript
   export const API_BASE_URL = 'http://YOUR_LOCAL_IP:5000/api';
   ```
   
   Replace `YOUR_LOCAL_IP` with your machine's local IP (e.g., `192.168.1.100`)

4. **Start Expo**
   ```bash
   npm start
   ```

5. **Run on device/emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

---

### Quick API Overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | ❌ | Register new user |
| `/api/auth/login` | POST | ❌ | Login user |
| `/api/price/live` | GET | ❌ | Get live gold price |
| `/api/kyc/submit` | POST | ✅ | Submit KYC |
| `/api/kyc/status` | GET | ✅ | Get KYC status |
| `/api/orders/buy` | POST | ✅ | Initiate buy order |
| `/api/orders/sell` | POST | ✅ | Initiate sell order |
| `/api/wallet` | GET | ✅ | Get wallet details |
| `/api/wallet/transactions` | GET | ✅ | Get transaction history |

---


### Collections
- **users** - User accounts
- **kyc** - KYC documents
- **orders** - Buy/Sell orders
- **transactions** - Transaction ledger
- **prices** - Gold price history

---

## 🎨 UI Screens

### Implemented
- ✅ Splash Screen
- ✅ Login Screen
- ✅ Register Screen
- ✅ Dashboard
- ✅ Live Price Screen
- ✅ Buy Gold Screen
- ✅ Sell Gold Screen
- ✅ Wallet Screen
- ✅ Transaction History
- ✅ KYC Screen
- ✅ Profile Screen

### Design Principles
- **Modern Fintech UI** - Inspired by Jar, Upstox Gold
- **Gold Theme** - Yellow/Gold gradients with clean white/black
- **Minimalistic** - Clean and intuitive
- **Animated** - Smooth transitions with React Native Reanimated

---

## 🔄 How It Works

### Buy Gold Flow
1. User enters amount in ₹
2. System calculates grams based on live price
3. Price is locked
4. CashFree order is created (mock)
5. User completes payment
6. Payment is verified
7. Gold is added to wallet
8. Transaction is recorded

### Sell Gold Flow
1. User enters grams to sell
2. System calculates amount based on sell price
3. User confirms
4. Gold is deducted from wallet
5. Money is added to wallet balance
6. Transaction is recorded

### Price Update
- Cron job runs every 30 seconds
- Generates mock price fluctuation (-50 to +50)
- Maintains spread between buy/sell price
- Stores in database for history

---

## 🧪 Testing

### Test User
After starting the server, you can register a test user or use:
```json
{
  "email": "test@goldvault.com",
  "password": "test123"
}
```

### Mock Features
- **CashFree**: All payment flows are mocked
- **KYC**: Auto-verified after 5 seconds
- **Gold Provider**: Mock SafeGold/Augmont order IDs

---

## 📦 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/goldvault
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:19000
```

### Frontend (constants/index.ts)
```typescript
API_BASE_URL=http://192.168.1.100:5000/api
```

---

## 🚧 Roadmap

- [ ] Add Lottie animations
- [ ] Implement price charts
- [ ] Add push notifications
- [ ] Bank account linking
- [ ] Physical gold redemption
- [ ] Referral system
- [ ] SIP (Systematic Investment Plan)
- [ ] Real CashFree integration
- [ ] Real SafeGold/Augmont integration

---

## 🤝 Contributing

This is a demo project. Feel free to fork and customize!

---

## 📄 License

MIT License - feel free to use for learning and commercial projects.

---

## 👨‍💻 Author

Built with ❤️ for learning purposes

---

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

## 🙏 Acknowledgments

- Inspired by Jar, SafeGold, and Augmont
- UI design inspired by modern fintech apps
- Mock data and flows for educational purposes

---

**Happy Coding! 🚀**
