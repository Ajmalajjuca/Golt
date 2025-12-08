import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
}) => {
  const getButtonStyle = () => {
    const baseStyle = 'py-4 px-6 rounded-xl items-center justify-center';
    
    if (disabled || loading) {
      return `${baseStyle} bg-gray-300`;
    }

    switch (variant) {
      case 'primary':
        return `${baseStyle} bg-yellow-400 `;
      case 'secondary':
        return `${baseStyle} bg-gray-800`;
      case 'outline':
        return `${baseStyle} border-2 border-yellow-500 bg-transparent`;
      default:
        return `${baseStyle} bg-yellow-500`;
    }
  };

  const getTextStyle = () => {
    if (variant === 'outline') {
      return 'text-yellow-500 font-semibold text-base';
    }
    return 'text-white font-semibold text-base';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${getButtonStyle()} ${fullWidth ? 'w-full' : ''}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : '#fff'} />
      ) : (
        <Text className={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
