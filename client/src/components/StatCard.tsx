import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  label: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  badge?: string;
  onPress?: () => void;
  style?: ViewStyle;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBg,
  label,
  value,
  subtitle,
  trend,
  trendValue,
  badge,
  onPress,
  style,
  delay = 0,
}) => {
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return { name: 'trending-up' as const, color: theme.colors.green };
      case 'down':
        return { name: 'trending-down' as const, color: theme.colors.red };
      default:
        return null;
    }
  };

  const trendIcon = getTrendIcon();
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <CardComponent
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={!onPress}
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          ...theme.shadows.md,
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Badge (optional) */}
        {badge && (
          <View
            style={{
              position: 'absolute',
              top: theme.spacing.md,
              right: theme.spacing.md,
              backgroundColor: theme.colors.primary + '20',
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: 4,
              borderRadius: theme.borderRadius.sm,
            }}
          >
            <Text
              style={{
                ...theme.typography.tiny,
                color: theme.colors.primary,
                fontWeight: '700',
              }}
            >
              {badge}
            </Text>
          </View>
        )}

        {/* Icon */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: iconBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.md,
          }}
        >
          <Ionicons name={icon} size={24} color={theme.colors.white} />
        </View>

        {/* Label */}
        <Text
          style={{
            ...theme.typography.small,
            color: theme.colors.gray500,
            marginBottom: theme.spacing.xs,
          }}
        >
          {label}
        </Text>

        {/* Value with optional trend */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs }}>
          <Text
            style={{
              ...theme.typography.h3,
              color: theme.colors.black,
            }}
          >
            {value}
          </Text>
          
          {/* Trend Indicator */}
          {trendIcon && trendValue && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: theme.spacing.sm,
                backgroundColor: trendIcon.color + '20',
                paddingHorizontal: theme.spacing.xs,
                paddingVertical: 2,
                borderRadius: theme.borderRadius.sm,
              }}
            >
              <Ionicons name={trendIcon.name} size={14} color={trendIcon.color} />
              <Text
                style={{
                  ...theme.typography.tiny,
                  color: trendIcon.color,
                  fontWeight: '700',
                  marginLeft: 2,
                }}
              >
                {trendValue}
              </Text>
            </View>
          )}
        </View>

        {/* Subtitle (optional) */}
        {subtitle && (
          <Text
            style={{
              ...theme.typography.small,
              color: theme.colors.gray400,
            }}
          >
            {subtitle}
          </Text>
        )}

        {/* Pressable Indicator */}
        {onPress && (
          <View
            style={{
              position: 'absolute',
              bottom: theme.spacing.md,
              right: theme.spacing.md,
            }}
          >
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
          </View>
        )}
      </CardComponent>
    </Animated.View>
  );
};