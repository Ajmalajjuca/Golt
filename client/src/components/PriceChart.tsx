import React, { useState } from 'react';
import { View, Text, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

// Support both old Price type and new PriceData type
interface PricePoint {
  buyPrice: number;
  sellPrice: number;
  timestamp: string;
}

interface PriceChartProps {
  priceHistory: PricePoint[];
  type?: 'buy' | 'sell' | 'both';
  showGrid?: boolean;
  height?: number;
  showSummary?: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({ 
  priceHistory,
  type = 'buy',
  showGrid = false,
  height = 200,
  showSummary = false,
}) => {
  const screenWidth = Dimensions.get('window').width - 48;
  const chartHeight = height;
  const padding = { top: 20, right: 25, bottom: 20, left: 0 };

  const [selectedPoint, setSelectedPoint] = useState<{ 
    price: number; 
    date: string; 
    x: number; 
    y: number;
    index: number;
  } | null>(null);

  // Generate mock data if no price history
  const mockData: PricePoint[] = Array.from({ length: 50 }, (_, i) => {
    const basePrice = 6500;
    const trend = i * 3;
    const noise = Math.sin(i / 5) * 50 + Math.random() * 30;
    return {
      buyPrice: basePrice + trend + noise,
      sellPrice: basePrice + trend + noise - 50,
      timestamp: new Date(Date.now() - (49 - i) * 3600000).toISOString(),
    };
  });

  const data = priceHistory && priceHistory.length > 0 ? priceHistory : mockData;

  // Get prices based on type
  const getPriceValue = (price: PricePoint) => {
    return type === 'sell' ? price.sellPrice : price.buyPrice;
  };

  const prices = data.map(getPriceValue);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 100;

  // Add padding to price range for better visualization
  const paddedMin = minPrice - priceRange * 0.1;
  const paddedMax = maxPrice + priceRange * 0.1;
  const paddedRange = paddedMax - paddedMin;

  // Chart dimensions
  const chartWidth = screenWidth - padding.left - padding.right;
  const chartInnerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate price change
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = (priceChange / firstPrice) * 100;
  const isPositive = priceChange >= 0;

  // Calculate points
  const points = prices.map((price, index) => {
    const x = padding.left + (index / (prices.length - 1)) * chartWidth;
    const y = padding.top + chartInnerHeight - ((price - paddedMin) / paddedRange) * chartInnerHeight;
    return { x, y, price, date: data[index].timestamp };
  });

  // Create smooth path using bezier curves
  const createSmoothPath = (fillArea: boolean = false) => {
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = current.x + (next.x - current.x) / 2;
      path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    if (fillArea) {
      const lastPoint = points[points.length - 1];
      path += ` L ${lastPoint.x} ${chartHeight - padding.bottom}`;
      path += ` L ${points[0].x} ${chartHeight - padding.bottom}`;
      path += ' Z';
    }

    return path;
  };

  const linePath = createSmoothPath(false);
  const areaPath = createSmoothPath(true);

  // Determine gradient and line colors based on trend
  const lineColor = isPositive ? theme.colors.green : theme.colors.red;
  const gradientId = isPositive ? 'chartGradientGreen' : 'chartGradientRed';

  // Grid lines
  const gridLines = showGrid ? 3 : 0;
  const gridYPositions = Array.from({ length: gridLines }, (_, i) => {
    return padding.top + (chartInnerHeight / (gridLines + 1)) * (i + 1);
  });

  // Handle touch
  const handleTouch = (event: any) => {
    const { locationX } = event.nativeEvent;
    
    let closestPoint = points[0];
    let closestIndex = 0;
    let minDistance = Math.abs(locationX - points[0].x);
    
    points.forEach((point, index) => {
      const distance = Math.abs(locationX - point.x);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
        closestIndex = index;
      }
    });

    // Calculate change from first price to selected point
    const changeFromStart = closestPoint.price - firstPrice;
    const changePercentFromStart = (changeFromStart / firstPrice) * 100;

    const date = new Date(closestPoint.date);
    const formattedDate = date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setSelectedPoint({
      price: closestPoint.price,
      date: formattedDate,
      x: closestPoint.x,
      y: closestPoint.y,
      index: closestIndex,
    });
  };

  const handleTouchEnd = () => {
    setTimeout(() => setSelectedPoint(null), 2000);
  };

  return (
    <View>
      {/* Price Summary Header */}
      {showSummary && (
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        }}>
          <View>
            <Text style={{ ...theme.typography.small, color: theme.colors.gray500 }}>
              {type === 'buy' ? 'Buy Price' : 'Sell Price'}
            </Text>
            <Text style={{ 
              fontSize: 24,
              fontWeight: '700',
              color: theme.colors.black,
              marginTop: 2
            }}>
              ₹{lastPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: (isPositive ? theme.colors.green : theme.colors.red) + '20',
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: 4,
              borderRadius: theme.borderRadius.md,
            }}>
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={isPositive ? theme.colors.green : theme.colors.red}
              />
              <Text style={{ 
                ...theme.typography.small,
                fontWeight: '700',
                color: isPositive ? theme.colors.green : theme.colors.red,
                marginLeft: 4,
              }}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}
              </Text>
              <Text style={{ 
                ...theme.typography.small,
                fontWeight: '700',
                color: isPositive ? theme.colors.green : theme.colors.red,
                marginLeft: 4
              }}>
                ({priceChangePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Chart */}
      <TouchableWithoutFeedback onPress={handleTouch} onPressOut={handleTouchEnd}>
        <View>
          <Svg width={screenWidth} height={chartHeight}>
            {/* Gradient definitions */}
            <Defs>
              <LinearGradient id="chartGradientGreen" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.colors.green} stopOpacity="0.3" />
                <Stop offset="0.5" stopColor={theme.colors.green} stopOpacity="0.15" />
                <Stop offset="1" stopColor={theme.colors.green} stopOpacity="0" />
              </LinearGradient>
              <LinearGradient id="chartGradientRed" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.colors.red} stopOpacity="0.3" />
                <Stop offset="0.5" stopColor={theme.colors.red} stopOpacity="0.15" />
                <Stop offset="1" stopColor={theme.colors.red} stopOpacity="0" />
              </LinearGradient>
            </Defs>

            {/* Background grid lines */}
            {showGrid && gridYPositions.map((y, index) => (
              <Line
                key={`grid-${index}`}
                x1={padding.left}
                y1={y}
                x2={screenWidth - padding.right}
                y2={y}
                stroke={theme.colors.gray200}
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity={0.5}
              />
            ))}

            {/* Area gradient fill */}
            <Path d={areaPath} fill={`url(#${gradientId})`} />

            {/* Main price line */}
            <Path 
              d={linePath} 
              stroke={lineColor}
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Selected point indicator */}
            {selectedPoint && (
              <>
                {/* Vertical line */}
                <Line
                  x1={selectedPoint.x}
                  y1={padding.top}
                  x2={selectedPoint.x}
                  y2={chartHeight - padding.bottom}
                  stroke={lineColor}
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
                {/* Outer circle */}
                <Circle
                  cx={selectedPoint.x}
                  cy={selectedPoint.y}
                  r="8"
                  fill={lineColor}
                  opacity={0.2}
                />
                {/* Inner circle */}
                <Circle
                  cx={selectedPoint.x}
                  cy={selectedPoint.y}
                  r="5"
                  fill={theme.colors.white}
                  stroke={lineColor}
                  strokeWidth="3"
                />
              </>
            )}
          </Svg>

          {/* Enhanced Tooltip */}
          {selectedPoint && (
            <View
              style={{
                position: 'absolute',
                top: selectedPoint.y < 80 ? selectedPoint.y + 20 : selectedPoint.y - 75,
                left: Math.max(20, Math.min(selectedPoint.x - 70, screenWidth - 160)),
                backgroundColor: theme.colors.black,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.borderRadius.lg,
                minWidth: 140,
                ...theme.shadows.lg,
              }}
            >
              <Text style={{ 
                fontSize: 18,
                fontWeight: '700',
                color: theme.colors.white,
                marginBottom: 2
              }}>
                ₹{selectedPoint.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Text>
              <Text style={{ 
                ...theme.typography.tiny,
                color: theme.colors.gray300,
              }}>
                {selectedPoint.date}
              </Text>
              {/* Small arrow at bottom */}
              <View style={{
                position: 'absolute',
                bottom: selectedPoint.y < 80 ? undefined : -6,
                top: selectedPoint.y < 80 ? -6 : undefined,
                left: '50%',
                marginLeft: -6,
                width: 12,
                height: 12,
                backgroundColor: theme.colors.black,
                transform: [{ rotate: '45deg' }],
              }} />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Time Range Labels */}
      {data.length > 0 && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: theme.spacing.sm,
          paddingHorizontal: theme.spacing.xs,
        }}>
          <Text style={{ ...theme.typography.small, color: theme.colors.gray400 }}>
            {new Date(data[0].timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </Text>
          <Text style={{ ...theme.typography.small, color: theme.colors.gray400 }}>
            {new Date(data[data.length - 1].timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      )}
    </View>
  );
};