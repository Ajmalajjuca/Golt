import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, Animated } from 'react-native';
import { theme } from '../theme';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.gray200;
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.gray900;
      case 'outline':
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.gray400;
    switch (variant) {
      case 'primary':
      case 'secondary':
        return theme.colors.white;
      case 'outline':
        return theme.colors.primary;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? theme.colors.gray200 : theme.colors.primary;
    }
    return 'transparent';
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 100,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={{
          backgroundColor: getBackgroundColor(),
          borderRadius: theme.borderRadius.lg,
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor: getBorderColor(),
          minHeight: 56,
          ...theme.shadows.sm,
        }}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <Text
            style={{
              ...theme.typography.bodyBold,
              color: getTextColor(),
            }}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
