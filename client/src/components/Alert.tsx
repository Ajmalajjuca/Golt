import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export type AlertType = 'success' | 'error' | 'warning' | 'info';
export type AlertPosition = 'top' | 'center' | 'bottom';

interface AlertProps {
  type: AlertType;
  title: string;
  message?: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
  position?: AlertPosition;
  showIcon?: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  visible,
  onClose,
  duration = 3000,
  position = 'bottom',
  showIcon = true,
  action,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current; // Start from bottom (100)

  useEffect(() => {
    if (visible) {
      // Animate in from bottom to up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const handleClose = () => {
    // Animate out - slide down
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100, // Always slide down
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.white, // Solid white background
          borderColor: theme.colors.green,
          iconColor: theme.colors.green,
          iconBgColor: theme.colors.green + '20', // Light background for icon
          iconName: 'checkmark-circle' as const,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.white,
          borderColor: theme.colors.red,
          iconColor: theme.colors.red,
          iconBgColor: theme.colors.red + '20',
          iconName: 'alert-circle' as const,
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.white,
          borderColor: theme.colors.primary,
          iconColor: theme.colors.primary,
          iconBgColor: theme.colors.primary + '20',
          iconName: 'warning' as const,
        };
      case 'info':
        return {
          backgroundColor: theme.colors.white,
          borderColor: '#3B82F6',
          iconColor: '#3B82F6',
          iconBgColor: '#3B82F6' + '20',
          iconName: 'information-circle' as const,
        };
    }
  };

  const config = getAlertConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' && styles.positionTop,
        position === 'center' && styles.positionCenter,
        position === 'bottom' && styles.positionBottom,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.alert,
          {
            backgroundColor: config.backgroundColor,
            borderLeftColor: config.borderColor,
          },
        ]}
      >
        {/* Icon */}
        {showIcon && (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: config.iconBgColor },
            ]}
          >
            <Ionicons name={config.iconName} size={24} color={config.iconColor} />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}

          {/* Action Button */}
          {action && (
            <TouchableOpacity
              onPress={() => {
                action.onPress();
                handleClose();
              }}
              style={[
                styles.actionButton,
                { backgroundColor: config.borderColor },
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Close Button */}
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={theme.colors.gray500} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  positionTop: {
    top: 60,
  },
  positionCenter: {
    top: '40%',
  },
  positionBottom: {
    bottom: 100,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    ...theme.shadows.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: 4,
  },
  message: {
    ...theme.typography.small,
    color: theme.colors.gray600,
  },
  actionButton: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  actionLabel: {
    ...theme.typography.small,
    fontWeight: '700',
    color: theme.colors.white,
  },
  closeButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});