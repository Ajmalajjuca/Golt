
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { theme } from '../theme';

interface MetalToggleProps {
  selectedMetal: 'gold' | 'silver';
  onSelect: (metal: 'gold' | 'silver') => void;
}

export const MetalToggle: React.FC<MetalToggleProps> = ({ selectedMetal, onSelect }) => {
  const animatedValue = useRef(new Animated.Value(selectedMetal === 'gold' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: selectedMetal === 'gold' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [selectedMetal]);

  const toggleWidth = Dimensions.get('window').width - (theme.spacing.lg * 2);
  const tabWidth = (toggleWidth - 4) / 2; // 4px padding total

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, tabWidth + 2],
  });

  return (
    <View style={{
      width: '100%',
      height: 48,
      backgroundColor: theme.colors.gray100, // Light gray background
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 2,
      position: 'relative',
    }}>
      {/* Moving Background (Indicator) */}
      <Animated.View style={{
        position: 'absolute',
        width: tabWidth,
        height: 44,
        borderRadius: 22,
        backgroundColor:  selectedMetal === 'gold' ? 
           '#FFD700' : // Gold color
           '#C0C0C0',  // Silver color (metallic)
          // Actually, we might want a gradient or specific solid color.
          // Let's stick to a solid metallic look or simple white/dark depending on design.
          // The reference image had a gradient-ish look for active tab.
          // Let's use theme.colors.white for now or specific metal colors if requested.
        transform: [{ translateX }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
         {/* Optional: Add gradient if we had a gradient component. 
             For now, let's just style it based on selection.
         */}
      </Animated.View>
      
      {/* Background color override for active state to make it look metallic */}
      <Animated.View style={{
        position: 'absolute',
        width: tabWidth,
        height: 44,
        borderRadius: 22,
        backgroundColor: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [theme.colors.white, theme.colors.white] // White background for active
        }),
        transform: [{ translateX }],
        zIndex: -1
      }}/>


      {/* Gold Tab */}
      <TouchableOpacity
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
        onPress={() => onSelect('gold')}
        activeOpacity={1}
      >
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: selectedMetal === 'gold' ? theme.colors.black : theme.colors.gray500,
        }}>
          Gold
        </Text>
      </TouchableOpacity>

      {/* Silver Tab */}
      <TouchableOpacity
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
        onPress={() => onSelect('silver')}
        activeOpacity={1}
      >
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: selectedMetal === 'silver' ? theme.colors.black : theme.colors.gray500,
        }}>
          Silver
        </Text>
      </TouchableOpacity>
    </View>
  );
};
