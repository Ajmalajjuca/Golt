export const API_BASE_URL = __DEV__ 
  ? 'https://golt.onrender.com/api'  // Replace with your local IP
  : 'https://golt.onrender.com/api';

export const RAZORPAY_KEY_ID = 'rzp_test_xxxxxxxxxx'; // Replace with actual key

export const COLORS = {
  primary: '#FFD700',      // Gold
  primaryDark: '#FFA500',  // Dark Gold
  secondary: '#1A1A1A',    // Dark Background
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#1A1A1A',
  textLight: '#666666',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  border: '#E5E5E5',
  gold: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  }
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  semibold: 'System',
};

export const PRICE_REFRESH_INTERVAL = 20000; // 20 seconds
