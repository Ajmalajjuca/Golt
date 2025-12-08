import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';


interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  gradient?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  onPress, 
  gradient = false,
  className = '' 
}) => {
  const content = (
    <View className={`bg-white rounded-2xl p-4 shadow-sm ${className}`}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

interface GoldCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GoldCard: React.FC<GoldCardProps> = ({ children, className = '' }) => {
  return (
    <View className={`bg-yellow-500 rounded-2xl p-6 shadow-lg ${className}`}>
      {children}
    </View>
  );
};
