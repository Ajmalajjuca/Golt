import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface AnimatedNumberProps {
  value: number;
  fontSize?: number;
  fontWeight?: '400' | '500' | '600' | '700' | '800' | '900';
  color?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  showTrend?: boolean;
  animationType?: 'slide' | 'scale' | 'fade' | 'bounce';
  duration?: number;
}

// Enhanced version with multiple animation types
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  fontSize = 48,
  fontWeight = '700',
  color = theme.colors.black,
  prefix = '₹',
  suffix = '',
  decimals = 2,
  showTrend = false,
  animationType = 'slide',
  duration = 600,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (value !== displayValue) {
      const isIncreasing = value > displayValue;
      setPreviousValue(displayValue);

      // Choose animation based on type
      switch (animationType) {
        case 'slide':
          animateSlide(isIncreasing);
          break;
        case 'scale':
          animateScale();
          break;
        case 'fade':
          animateFade();
          break;
        case 'bounce':
          animateBounce();
          break;
      }

      // Animate number change
      animateValue(value);
    }
  }, [value]);

  const animateSlide = (isIncreasing: boolean) => {
    slideAnim.setValue(isIncreasing ? 20 : -20);
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const animateScale = () => {
    scaleAnim.setValue(1.1);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const animateFade = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: duration / 2,
      useNativeDriver: true,
    }).start();
  };

  const animateBounce = () => {
    scaleAnim.setValue(0.8);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateValue = (targetValue: number) => {
    const steps = 30;
    const increment = (targetValue - displayValue) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(targetValue);
        clearInterval(interval);
      } else {
        setDisplayValue((prev) => prev + increment);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  };

  const formatNumber = (num: number) => {
    const formatted = num.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    const parts = formatted.split('.');
    return {
      integer: parts[0],
      decimal: parts[1] || '',
    };
  };

  const { integer, decimal } = formatNumber(displayValue);
  const isIncreasing = displayValue > previousValue;

  const getTransform = () => {
    const transforms = [];
    if (animationType === 'slide') {
      transforms.push({ translateY: slideAnim });
    }
    if (animationType === 'scale' || animationType === 'bounce') {
      transforms.push({ scale: scaleAnim });
    }
    return transforms;
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {/* Trend indicator */}
      {showTrend && displayValue !== previousValue && (
        <Animated.View
          style={{
            marginRight: 8,
            opacity: fadeAnim,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: isIncreasing
                ? theme.colors.green + '20'
                : theme.colors.red + '20',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={isIncreasing ? 'trending-up' : 'trending-down'}
              size={14}
              color={isIncreasing ? theme.colors.green : theme.colors.red}
            />
          </View>
        </Animated.View>
      )}

      {/* Animated number */}
      <Animated.View
        style={{
          opacity: animationType === 'fade' ? fadeAnim : 1,
          transform: getTransform(),
        }}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize,
              fontWeight,
              color,
            },
          ]}
        >
          {prefix}
          {integer}
          {decimals > 0 && decimal && (
            <Text style={{ color: theme.colors.gray400, fontSize: fontSize * 0.8 }}>
              .{decimal}
            </Text>
          )}
          {suffix && (
            <Text style={{ color: theme.colors.gray500, fontSize: fontSize * 0.6 }}>
              {' '}
              {suffix}
            </Text>
          )}
        </Text>
      </Animated.View>
    </View>
  );
};

// Simplified version for basic use cases
export const AnimatedNumberSimple: React.FC<AnimatedNumberProps> = ({
  value,
  fontSize = 48,
  fontWeight = '700',
  color = theme.colors.black,
  prefix = '₹',
  suffix = '',
  decimals = 2,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value !== displayValue) {
      const isIncreasing = value > displayValue;

      // Slide animation
      slideAnim.setValue(isIncreasing ? 20 : -20);

      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Animate number change
      const steps = 30;
      const increment = (value - displayValue) / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue((prev) => prev + increment);
        }
      }, 20);

      return () => clearInterval(interval);
    }
  }, [value]);

  const formatNumber = (num: number) => {
    const formatted = num.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    const parts = formatted.split('.');
    return {
      integer: parts[0],
      decimal: parts[1] || '',
    };
  };

  const { integer, decimal } = formatNumber(displayValue);

  return (
    <Animated.Text
      style={[
        styles.text,
        {
          fontSize,
          fontWeight,
          color,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {prefix}
      {integer}
      {decimals > 0 && decimal && (
        <Text style={{ color: theme.colors.gray400, fontSize: fontSize * 0.8 }}>
          .{decimal}
        </Text>
      )}
      {suffix && (
        <Text style={{ color: theme.colors.gray500, fontSize: fontSize * 0.6 }}>
          {' '}
          {suffix}
        </Text>
      )}
    </Animated.Text>
  );
};

// Compact version for small spaces
export const AnimatedNumberCompact: React.FC<AnimatedNumberProps> = ({
  value,
  fontSize = 16,
  fontWeight = '600',
  color = theme.colors.black,
  prefix = '₹',
  suffix = '',
  decimals = 0,
  showTrend = true,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (value !== displayValue) {
      setPreviousValue(displayValue);

      // Quick scale animation
      scaleAnim.setValue(1.1);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }).start();

      // Quick value update
      const steps = 15;
      const increment = (value - displayValue) / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue((prev) => prev + increment);
        }
      }, 15);

      return () => clearInterval(interval);
    }
  }, [value]);

  const isIncreasing = displayValue > previousValue;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Text
          style={{
            fontSize,
            fontWeight,
            color: showTrend
              ? isIncreasing
                ? theme.colors.green
                : displayValue < previousValue
                ? theme.colors.red
                : color
              : color,
          }}
        >
          {prefix}
          {displayValue.toLocaleString('en-IN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}
          {suffix}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    letterSpacing: -1,
  },
});