import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { AlertType } from './Alert';

interface ToastProps {
  type: AlertType;
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  visible,
  onClose,
  duration = 2000,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 50,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onClose());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.green,
          iconName: 'checkmark-circle' as const,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.red,
          iconName: 'close-circle' as const,
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.primary,
          iconName: 'warning' as const,
        };
      case 'info':
        return {
          backgroundColor: '#3B82F6',
          iconName: 'information-circle' as const,
        };
    }
  };

  const config = getToastConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <Ionicons name={config.iconName} size={20} color={theme.colors.white} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
    zIndex: 9999,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
});