import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme';

interface PeriodSelectorProps {
  periods: string[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  scrollable?: boolean;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periods,
  selectedPeriod,
  onPeriodChange,
  scrollable = false,
}) => {
  const Container = scrollable ? ScrollView : View;

  return (
    <Container
      horizontal={scrollable}
      showsHorizontalScrollIndicator={false}
      style={{
        flexDirection: 'row',
        ...(!scrollable && { 
          justifyContent: 'space-between',
          alignItems: 'center',
        }),
      }}
    >
      {periods.map((period, index) => {
        const isSelected = period === selectedPeriod;
        return (
          <TouchableOpacity
            key={period}
            onPress={() => onPeriodChange(period)}
            style={{
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.borderRadius.full || 20,
              backgroundColor: isSelected 
                ? theme.colors.primary 
                : theme.colors.gray100,
              marginRight: scrollable && index < periods.length - 1 ? theme.spacing.xs : 0,
              minWidth: 50,
              alignItems: 'center',
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                ...theme.typography.small,
                fontWeight: isSelected ? '700' : '500',
                color: isSelected ? theme.colors.white : theme.colors.gray600,
              }}
            >
              {period}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Container>
  );
};