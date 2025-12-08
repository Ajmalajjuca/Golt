import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onBuyPress: () => void;
  onSellPress: () => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ 
  visible, 
  onClose, 
  onBuyPress,
  onSellPress 
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 9,
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
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const actions = [
    {
      icon: 'arrow-down-circle' as const,
      label: 'Buy',
      sublabel: 'Purchase gold',
      color: theme.colors.green,
      onPress: onBuyPress,
    },
    {
      icon: 'arrow-up-circle' as const,
      label: 'Sell',
      sublabel: 'Sell your gold',
      color: theme.colors.red,
      onPress: onSellPress,
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
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.white,
            borderTopLeftRadius: theme.borderRadius.xxl,
            borderTopRightRadius: theme.borderRadius.xxl,
            paddingBottom: 40,
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: theme.colors.gray300,
              borderRadius: 2,
              alignSelf: 'center',
              marginTop: theme.spacing.md,
              marginBottom: theme.spacing.xl,
            }}
          />

          {/* Title */}
          <View style={{ paddingHorizontal: theme.spacing.xl, marginBottom: theme.spacing.lg }}>
            <Text style={{ ...theme.typography.h3, color: theme.colors.black }}>
              Quick Actions
            </Text>
            <Text style={{ ...theme.typography.small, color: theme.colors.gray500, marginTop: 4 }}>
              Choose an action to continue
            </Text>
          </View>

          {/* Actions */}
          <View style={{ paddingHorizontal: theme.spacing.xl }}>
            {actions.map((action, index) => (
              <ActionMenuItem
                key={index}
                {...action}
                delay={index * 50}
                visible={visible}
              />
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

interface ActionMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  color: string;
  onPress: () => void;
  delay: number;
  visible: boolean;
}

const ActionMenuItem: React.FC<ActionMenuItemProps> = ({
  icon,
  label,
  sublabel,
  color,
  onPress,
  delay,
  visible,
}) => {
  const [slideAnim] = useState(new Animated.Value(20));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(20);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          backgroundColor: theme.colors.gray50,
          borderRadius: theme.borderRadius.lg,
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: theme.borderRadius.full,
              backgroundColor: color + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: theme.spacing.md,
            }}
          >
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                ...theme.typography.bodyBold,
                color: theme.colors.black,
              }}
            >
              {label}
            </Text>
            <Text
              style={{
                ...theme.typography.small,
                color: theme.colors.gray500,
                marginTop: 2,
              }}
            >
              {sublabel}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={color} />
      </TouchableOpacity>
    </Animated.View>
  );
};
