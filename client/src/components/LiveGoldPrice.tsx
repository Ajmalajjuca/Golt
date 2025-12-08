import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface LiveGoldPriceProps {
  buyPrice: number;
  sellPrice: number;
  change?: number;
  changePercent?: number;
  showSellPrice?: boolean;
  onPress?: () => void;
  compact?: boolean;
}

export const LiveGoldPrice: React.FC<LiveGoldPriceProps> = ({
  buyPrice,
  sellPrice,
  changePercent = 0,
}) => {
  const isPositive = changePercent >= 0;

  return (
    <View style={{
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
    }}>
      {/* Live indicator + Price */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.colors.green,
          marginRight: theme.spacing.sm,
        }} />
        <View>
          <Text style={{ ...theme.typography.tiny, color: theme.colors.gray500 }}>
            Live Price
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ 
              fontSize: 20,
              fontWeight: '700',
              color: theme.colors.black 
            }}>
              ₹{buyPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Text>
            <Text style={{ 
              ...theme.typography.tiny,
              color: theme.colors.gray500,
              marginLeft: 3 
            }}>
              /gm
            </Text>
          </View>
        </View>
      </View>

      {/* Change Badge */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isPositive 
          ? theme.colors.green + '20' 
          : theme.colors.red + '20',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.md,
      }}>
        <Ionicons
          name={isPositive ? 'trending-up' : 'trending-down'}
          size={16}
          color={isPositive ? theme.colors.green : theme.colors.red}
        />
        <Text style={{
          ...theme.typography.small,
          fontWeight: '700',
          color: isPositive ? theme.colors.green : theme.colors.red,
          marginLeft: 4,
        }}>
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
};