import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  onFABPress: () => void;
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  onFABPress,
}) => {
  const tabBarHeight = 70;
  const fabSize = 64;
  const fabRight = 20;

  // Animation values for each tab
  const animatedValues = useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  // FAB animation
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValues.forEach((anim: any, index: number) => {
      Animated.spring(anim, {
        toValue: state.index === index ? 1 : 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index]);

  // SVG path for curved top edge with notch for FAB
  const createCurvePath = () => {
    const notchStart = SCREEN_WIDTH - fabRight - fabSize - 30;
    const notchCenter = SCREEN_WIDTH - fabRight - fabSize / 2;
    const notchEnd = SCREEN_WIDTH - fabRight + 10;
    
    return `
      M 0,20
      Q 0,0 20,0
      L ${notchStart},0
      Q ${notchStart + 10},0 ${notchStart + 10},10
      Q ${notchCenter},${fabSize / 2 + 5} ${notchEnd - 10},10
      Q ${notchEnd - 10},0 ${notchEnd},0
      L ${SCREEN_WIDTH - 20},0
      Q ${SCREEN_WIDTH},0 ${SCREEN_WIDTH},20
      L ${SCREEN_WIDTH},${tabBarHeight}
      L 0,${tabBarHeight}
      Z
    `;
  };

  const handleFABPress = () => {
    // Animate FAB
    Animated.sequence([
      Animated.parallel([
        Animated.spring(fabScale, {
          toValue: 0.85,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(fabRotate, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(fabScale, {
          toValue: 1,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(fabRotate, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    onFABPress();
  };

  const fabRotation = fabRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  return (
    <View style={styles.container}>
      {/* Custom curved background */}
      <View style={styles.tabBarContainer}>
        <Svg
          width={SCREEN_WIDTH}
          height={tabBarHeight}
          style={styles.svg}
        >
          <Defs>
            <LinearGradient id="tabBarGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.colors.white} stopOpacity="1" />
              <Stop offset="1" stopColor={theme.colors.white} stopOpacity="0.98" />
            </LinearGradient>
          </Defs>
          <Path
            d={createCurvePath()}
            fill="url(#tabBarGradient)"
          />
        </Svg>

        {/* Tab Icons */}
        <View style={styles.tabsContainer}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Icon selection
            let iconName: keyof typeof Ionicons.glyphMap = 'home';
            
            if (route.name === 'Home') {
              iconName = isFocused ? 'home' : 'home-outline';
            } else if (route.name === 'Transactions') {
              iconName = isFocused ? 'time' : 'time-outline';
            } else if (route.name === 'Wallet') {
              iconName = isFocused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'Profile') {
              iconName = isFocused ? 'person' : 'person-outline';
            }

            const scale = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            });

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isFocused 
                        ? theme.colors.black 
                        : 'transparent',
                      transform: [{ scale }],
                    },
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={24}
                    color={isFocused ? theme.colors.white : theme.colors.gray400}
                  />
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* FAB Button */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            right: fabRight,
            transform: [
              { scale: fabScale },
              { rotate: fabRotation },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleFABPress}
          style={[
            styles.fab,
            {
              width: fabSize,
              height: fabSize,
              borderRadius: fabSize / 2,
            },
          ]}
          activeOpacity={0.85}
        >
          {/* Outer ring */}
          <View style={[
            styles.fabRing,
            {
              width: fabSize + 8,
              height: fabSize + 8,
              borderRadius: (fabSize + 8) / 2,
            }
          ]} />
          
          {/* Inner content */}
          <View style={styles.fabInner}>
            <Ionicons name="add" size={32} color={theme.colors.white} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarContainer: {
    position: 'relative',
    height: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  svg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  tabsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 100,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 10,
  },
  fab: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.xl,
  },
  fabRing: {
    position: 'absolute',
    backgroundColor: theme.colors.primary + '30',
  },
  fabInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});