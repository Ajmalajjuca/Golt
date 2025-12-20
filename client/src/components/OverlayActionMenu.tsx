import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface ActionItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

interface OverlayActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onBuyPress: () => void;
  onSellPress: () => void;
  showCloseButton?: boolean;
  metalType: 'gold' | 'silver';
}

export const OverlayActionMenu: React.FC<OverlayActionMenuProps> = ({
  visible,
  onClose,
  onBuyPress,
  onSellPress,
  showCloseButton = true,
  metalType = 'gold',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim1 = useRef(new Animated.Value(0)).current;
  const scaleAnim2 = useRef(new Animated.Value(0)).current;
  const translateY1 = useRef(new Animated.Value(60)).current;
  const translateY2 = useRef(new Animated.Value(60)).current;
  const opacityAnim1 = useRef(new Animated.Value(0)).current;
  const opacityAnim2 = useRef(new Animated.Value(0)).current;
  const closeButtonRotate = useRef(new Animated.Value(0)).current;
  const closeButtonScale = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    if (visible) {
      // Reset all animations to initial state
      fadeAnim.setValue(0);
      scaleAnim1.setValue(0);
      scaleAnim2.setValue(0);
      translateY1.setValue(60);
      translateY2.setValue(60);
      opacityAnim1.setValue(0);
      opacityAnim2.setValue(0);
      closeButtonRotate.setValue(0);
      closeButtonScale.setValue(0);

      // Start animations
      Animated.parallel([
        // Blur fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        // Close button rotation
        Animated.spring(closeButtonRotate, {
          toValue: 1,
          delay: 50,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(closeButtonScale, {
          toValue: 1,
          delay: 50,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        // First button (Buy)
        Animated.parallel([
          Animated.spring(scaleAnim1, {
            toValue: 1,
            delay: 100,
            tension: 70,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(translateY1, {
            toValue: 0,
            delay: 100,
            tension: 70,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim1, {
            toValue: 1,
            delay: 100,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Second button (Sell)
        Animated.parallel([
          Animated.spring(scaleAnim2, {
            toValue: 1,
            delay: 150,
            tension: 70,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(translateY2, {
            toValue: 0,
            delay: 150,
            tension: 70,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim2, {
            toValue: 1,
            delay: 150,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim1, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim2, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY1, {
          toValue: 60,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY2, {
          toValue: 60,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim1, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim2, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(closeButtonRotate, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(closeButtonScale, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const closeButtonRotation = closeButtonRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });
  const actions: ActionItem[] = [
    {
      icon: 'arrow-up',
      label: `Sell ${metalType === 'gold' ? 'Gold' : 'Silver'}`,
      color: theme.colors.red,
      onPress: onSellPress,
    },
    {
      icon: 'arrow-down',
      label: `Buy ${metalType === 'gold' ? 'Gold' : 'Silver'}`,
      color: theme.colors.green,
      onPress: onBuyPress,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Background overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={styles.backdrop}
        >
          <View style={styles.actionsContainer}>
            {/* Action Buttons */}
            {actions.map((action, index) => {
              const scaleAnim = index === 0 ? scaleAnim2 : scaleAnim1;
              const translateY = index === 0 ? translateY2 : translateY1;
              const opacityAnim = index === 0 ? opacityAnim2 : opacityAnim1;

              return (
                <Animated.View
                  key={action.label}
                  style={[
                    styles.actionWrapper,
                    {
                      opacity: opacityAnim,
                      transform: [
                        { scale: scaleAnim },
                        { translateY: translateY },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => {
                      action.onPress();
                      onClose();
                    }}
                    style={[
                      styles.actionButton,
                      { 
                        backgroundColor: action.color,
                      }
                    ]}
                    activeOpacity={0.85}
                  >
                    <View style={styles.actionContent}>
                      <View style={[
                        styles.iconContainer,
                        { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                      ]}>
                        <Ionicons name={action.icon} size={22} color={theme.colors.white} />
                      </View>
                      <Text style={styles.actionLabel}>{action.label}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'flex-end',
  },
  actionWrapper: {
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 160,
    ...theme.shadows.lg,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionLabel: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.white,
  },
  closeButtonWrapper: {
    marginTop: 16,
  },
  closeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.xl,
  },
});