import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme';

interface QuickAmountSelectorProps {
  amounts: number[];
  selectedAmount?: number;
  onAmountSelect: (amount: number) => void;
  currency?: string;
}

export const QuickAmountSelector: React.FC<QuickAmountSelectorProps> = ({
  amounts,
  selectedAmount,
  onAmountSelect,
  currency = '₹',
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingVertical: theme.spacing.sm,
      }}
    >
      {amounts.map((amount, index) => {
        const isSelected = amount === selectedAmount;
        return (
          <TouchableOpacity
            key={amount}
            onPress={() => onAmountSelect(amount)}
            style={{
              backgroundColor: isSelected ? theme.colors.primary : theme.colors.white,
              borderRadius: theme.borderRadius.md,
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.lg,
              marginRight: index < amounts.length - 1 ? theme.spacing.sm : 0,
              borderWidth: 1,
              borderColor: isSelected ? theme.colors.primary : theme.colors.gray200,
              ...theme.shadows.sm,
            }}
          >
            <Text
              style={{
                ...theme.typography.bodyBold,
                color: isSelected ? theme.colors.white : theme.colors.gray900,
              }}
            >
              {currency}{amount >= 1000 ? `${amount / 1000}K` : amount}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
