import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { AlertType } from './Alert';

interface ModalAlertProps {
  type: AlertType;
  title: string;
  message: string;
  visible: boolean;
  onClose: () => void;
  primaryButton?: {
    label: string;
    onPress: () => void;
  };
  secondaryButton?: {
    label: string;
    onPress: () => void;
  };
}

export const ModalAlert: React.FC<ModalAlertProps> = ({
  type,
  title,
  message,
  visible,
  onClose,
  primaryButton,
  secondaryButton,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          iconColor: theme.colors.green,
          iconBackground: theme.colors.green + '20',
          iconName: 'checkmark-circle' as const,
        };
      case 'error':
        return {
          iconColor: theme.colors.red,
          iconBackground: theme.colors.red + '20',
          iconName: 'alert-circle' as const,
        };
      case 'warning':
        return {
          iconColor: theme.colors.primary,
          iconBackground: theme.colors.primary + '20',
          iconName: 'warning' as const,
        };
      case 'info':
        return {
          iconColor: '#3B82F6',
          iconBackground: '#3B82F6' + '20',
          iconName: 'information-circle' as const,
        };
    }
  };

  const config = getAlertConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: config.iconBackground },
            ]}
          >
            <Ionicons name={config.iconName} size={48} color={config.iconColor} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {secondaryButton && (
              <TouchableOpacity
                onPress={() => {
                  secondaryButton.onPress();
                  onClose();
                }}
                style={[styles.button, styles.secondaryButton]}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>
                  {secondaryButton.label}
                </Text>
              </TouchableOpacity>
            )}

            {primaryButton && (
              <TouchableOpacity
                onPress={() => {
                  primaryButton.onPress();
                  onClose();
                }}
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: config.iconColor },
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {primaryButton.label}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  modal: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.gray600,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  primaryButton: {
    ...theme.shadows.md,
  },
  secondaryButton: {
    backgroundColor: theme.colors.gray100,
  },
  primaryButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.white,
  },
  secondaryButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.gray700,
  },
});