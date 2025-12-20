import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface TransactionItemProps {
  type: 'buy' | 'sell' | 'buy_gold' | 'sell_gold' | 'buy_silver' | 'sell_silver' | 'deposit' | 'withdrawal';
  amount: string;
  date: string;
  value: string;
  onPress?: () => void;
  showBorder?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  type,
  amount,
  date,
  value,
  onPress,
  showBorder = true,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'buy':
      case 'buy_gold':
      case 'buy_silver':
        return { name: 'arrow-down-circle' as const, color: theme.colors.green };
      case 'sell':
      case 'sell_gold':
      case 'sell_silver':
        return { name: 'arrow-up-circle' as const, color: theme.colors.red };
      case 'deposit':
        return { name: 'add-circle' as const, color: '#3B82F6' };
      case 'withdrawal':
        return { name: 'remove-circle' as const, color: theme.colors.primary };
      default:
        return { name: 'swap-horizontal' as const, color: theme.colors.gray500 };
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'buy':
      case 'buy_gold':
        return 'Buy Gold';
      case 'buy_silver':
        return 'Buy Silver';
      case 'sell':
      case 'sell_gold':
        return 'Sell Gold';
      case 'sell_silver':
        return 'Sell Silver';
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      default:
        return 'Transaction';
    }
  };

  const icon = getIcon();
  const isNegative = value.startsWith('-');

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.white,
        ...(onPress && {
          // Add subtle hover effect for pressable items
        }),
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: icon.color + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        }}
      >
        <Ionicons name={icon.name} size={20} color={icon.color} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            ...theme.typography.body,
            fontWeight: '600',
            color: theme.colors.black,
            marginBottom: 2,
          }}
        >
          {getTitle()}
        </Text>
        <Text
          style={{
            ...theme.typography.small,
            color: theme.colors.gray500,
          }}
        >
          {amount} • {date}
        </Text>
      </View>

      {/* Value */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            ...theme.typography.body,
            fontWeight: '700',
            color: isNegative ? theme.colors.red : theme.colors.green,
          }}
        >
          {value}
        </Text>
      </View>

      {/* Optional chevron for pressable items */}
      {onPress && (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={theme.colors.gray400} 
          style={{ marginLeft: theme.spacing.sm }}
        />
      )}
    </Component>
  );
};