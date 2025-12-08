import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  icon,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4">
      {label && <Text className="text-gray-700 font-medium mb-2">{label}</Text>}
      
      <View className={`flex-row items-center bg-gray-50 rounded-xl px-4 border ${error ? 'border-red-500' : 'border-gray-200'}`}>
        {icon && (
          <Ionicons name={icon} size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
        )}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          className="flex-1 py-4 text-gray-900"
          placeholderTextColor="#9CA3AF"
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
};
