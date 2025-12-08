// Design System Theme
// Based on Fuse wallet aesthetic with GoldVault branding

export const theme = {
  // Colors
  colors: {
    // Primary (Gold - Brand)
    primary: '#F59E0B',
    primaryLight: '#FCD34D',
    primaryDark: '#D97706',
    
    // Accents
    blue: '#4F7FFF',
    blueLight: '#93B4FF',
    orange: '#FF8C42',
    orangeLight: '#FFB380',
    purple: '#8B5CF6',
    purpleLight: '#A78BFA',
    green: '#10B981',
    greenLight: '#34D399',
    red: '#EF4444',
    redLight: '#F87171',
    
    // Neutrals
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    
    // Semantic
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Backgrounds
    background: '#FFFFFF',
    surface: '#F9FAFB',
    card: '#FFFFFF',
  },
  
  // Typography
  typography: {
    // Display (large numbers like $11.12)
    display: {
      fontSize: 48,
      fontWeight: '700' as const,
      lineHeight: 56,
      letterSpacing: -1,
    },
    
    // Headings
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    
    // Body
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    
    // Small
    small: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    smallBold: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    
    // Caption
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    captionBold: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 16,
    },
    
    // Tiny
    tiny: {
      fontSize: 10,
      fontWeight: '400' as const,
      lineHeight: 14,
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Border Radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Icon Sizes
  iconSizes: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    xxl: 48,
  },
};

// Helper functions
export const getColor = (color: keyof typeof theme.colors) => theme.colors[color];
export const getSpacing = (size: keyof typeof theme.spacing) => theme.spacing[size];
export const getBorderRadius = (size: keyof typeof theme.borderRadius) => theme.borderRadius[size];
export const getShadow = (size: keyof typeof theme.shadows) => theme.shadows[size];

export type Theme = typeof theme;
