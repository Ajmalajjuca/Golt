import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchCurrentPrice, 
  fetchChartData, 
  fetchStatistics,
  refreshPrice,
  setSelectedPeriod 
} from '../store/priceSlice';
import { 
  selectChartData,
  selectStatistics,
  selectSelectedPeriod,
  selectRefreshing,
  selectChartLoading,
  selectMetalType,
} from '../store/priceSelectors';
import { MetalToggle } from '../components/MetalToggle';
import { PeriodSelector } from '../components/PeriodSelector';
import { AnimatedNumberSimple } from '../components/AnimatedNumber';
import { PriceChart } from '../components/PriceChart';
import { OverlayActionMenu } from '../components/OverlayActionMenu';
import { walletService } from '../services';
import { WalletData } from '../types';
import { PRICE_REFRESH_INTERVAL } from '../constants';
import { theme } from '../theme';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  
  // Auth state
  const { user } = useAppSelector((state) => state.auth);
  
  // Price state from Redux
  const chartData = useAppSelector(selectChartData);
  const statistics = useAppSelector(selectStatistics);
  const selectedPeriod = useAppSelector(selectSelectedPeriod);
  const refreshing = useAppSelector(selectRefreshing);
  const chartLoading = useAppSelector(selectChartLoading);
  const metalType = useAppSelector(selectMetalType);
  


  
  
  // Local state
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Auto-refresh current price every 30 seconds
    const priceInterval = setInterval(() => {
      dispatch(fetchCurrentPrice());
    }, PRICE_REFRESH_INTERVAL);

    return () => clearInterval(priceInterval);
  }, [dispatch]);

  // Load chart data when period or metal changes
  useEffect(() => {
    dispatch(fetchChartData(selectedPeriod));
    dispatch(fetchStatistics(selectedPeriod));
    dispatch(fetchCurrentPrice());
  }, [dispatch, selectedPeriod, metalType]);

  const loadData = async () => {
    try {
      // Fetch current price
      dispatch(fetchCurrentPrice());
      
      // Fetch chart data for selected period
      dispatch(fetchChartData(selectedPeriod));
      
      // Fetch statistics
      dispatch(fetchStatistics(selectedPeriod));
      
      // Load wallet data
      setWalletLoading(true);
      const response = await walletService.getWallet();
      setWalletData(response.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setWalletLoading(false);
    }
  };

  const onRefresh = async () => {
    // Use the refresh thunk which forces API call
    await dispatch(refreshPrice());
    await loadData();
  };

  const handlePeriodChange = (period: string) => {
    dispatch(setSelectedPeriod(period));
  };
  
  const handleMetalChange = (metal: 'gold' | 'silver') => {
    // Dispatch action to change metal type
    // We need to import setMetalType from priceSlice
    // Note: This will trigger the effect above to reload data
    import('../store/priceSlice').then(({ setMetalType }) => {
       dispatch(setMetalType(metal));
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const formatGold = (grams: number) => {
    return `${grams.toFixed(4)}g`;
  };

  const totalValue = walletData 
    ? walletData.currentValue + walletData.walletBalance 
    : 0;

  const profitLossPercent = walletData?.profitLossPercentage || 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ 
          padding: theme.spacing.lg,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xxxl,
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: theme.spacing.xl 
          }}>
            <View>
              <Text style={{ 
                ...theme.typography.small, 
                color: theme.colors.gray500,
                marginBottom: 4,
              }}>
                Welcome back,
              </Text>
              <Text style={{ ...theme.typography.h2, color: theme.colors.black }}>
                {user?.name}
              </Text>
            </View>
            
            {/* Notification Icon */}
            <TouchableOpacity
              onPress={() => navigation.navigate('PriceAlert')}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.colors.white,
                alignItems: 'center',
                justifyContent: 'center',
                ...theme.shadows.sm,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={24} color={theme.colors.black} />
            </TouchableOpacity>
          </View>
          
          {/* Metal Toggle */}
          <View style={{ marginBottom: theme.spacing.lg }}>
            <MetalToggle 
              selectedMetal={metalType} 
              onSelect={handleMetalChange} 
            />
          </View>

          {/* Total Balance Card */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Wallet')}
            activeOpacity={0.8}
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius.xl,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
              ...theme.shadows.md,
            }}
          >
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: theme.spacing.md,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.primary + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: theme.spacing.sm,
                }}>
                  <Ionicons name="wallet" size={18} color={theme.colors.primary} />
                </View>
                <Text style={{ ...theme.typography.body, color: theme.colors.gray600 }}>
                  Total Portfolio Value
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
            </View>
            
            {/* Animated Balance */}
            {walletLoading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
              <>
                <AnimatedNumberSimple
                  value={totalValue}
                  fontSize={40}
                  fontWeight="700"
                  color={theme.colors.black}
                  prefix="₹"
                  decimals={2}
                />
                
                {walletData && walletData.profitLoss !== 0 && (
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginTop: theme.spacing.sm 
                  }}>
                    <View style={{
                      backgroundColor: profitLossPercent >= 0 
                        ? theme.colors.green + '20' 
                        : theme.colors.red + '20',
                      paddingHorizontal: theme.spacing.sm,
                      paddingVertical: 4,
                      borderRadius: theme.borderRadius.md,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <Ionicons
                        name={profitLossPercent >= 0 ? 'trending-up' : 'trending-down'}
                        size={14}
                        color={profitLossPercent >= 0 ? theme.colors.green : theme.colors.red}
                      />
                      <Text
                        style={{
                          ...theme.typography.small,
                          color: profitLossPercent >= 0 ? theme.colors.green : theme.colors.red,
                          marginLeft: 4,
                          fontWeight: '700',
                        }}
                      >
                        {profitLossPercent >= 0 ? '+' : ''}
                        {formatCurrency(walletData.profitLoss)} ({profitLossPercent.toFixed(2)}%)
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>

          {/* Chart Section */}
          <View style={{
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            ...theme.shadows.md,
          }}>
            {/* Chart Header */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.md,
            }}>
              <Text style={{ ...theme.typography.h3, color: theme.colors.black }}>
                {metalType === 'gold' ? 'Gold' : 'Silver'} Price Chart
              </Text>
              
              {/* Manual Refresh */}
              <TouchableOpacity
                onPress={() => dispatch(refreshPrice())}
                disabled={refreshing}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.gray100,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons 
                    name="refresh" 
                    size={18} 
                    color={refreshing ? theme.colors.gray400 : theme.colors.black}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Price Chart */}
            {chartLoading ? (
              <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : chartData ? (
              <PriceChart 
                priceHistory={chartData.prices} 
                type="buy"
                showSummary={true}
                showGrid={true}
                height={220}
              />  
            ) : (
              <View style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ ...theme.typography.body, color: theme.colors.gray400 }}>
                  No chart data available
                </Text>
              </View>
            )}
            
            {/* Period Selector */}
            <View style={{ marginTop: theme.spacing.md }}>
              <PeriodSelector
                periods={['1D', '1W', '1M', '3M', '6M', '1Y', 'All']}
                selectedPeriod={selectedPeriod}
                onPeriodChange={handlePeriodChange}
              />
            </View>

            {/* Chart Summary */}
            {chartData && (
              <View style={{
                marginTop: theme.spacing.lg,
                paddingTop: theme.spacing.lg,
                borderTopWidth: 1,
                borderTopColor: theme.colors.gray100,
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ ...theme.typography.small, color: theme.colors.gray500 }}>
                    High
                  </Text>
                  <Text style={{ ...theme.typography.body, fontWeight: '700', color: theme.colors.black, marginTop: 4 }}>
                    ₹{chartData.summary.high.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ ...theme.typography.small, color: theme.colors.gray500 }}>
                    Low
                  </Text>
                  <Text style={{ ...theme.typography.body, fontWeight: '700', color: theme.colors.black, marginTop: 4 }}>
                    ₹{chartData.summary.low.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ ...theme.typography.small, color: theme.colors.gray500 }}>
                    Change
                  </Text>
                  <Text style={{ 
                    ...theme.typography.body, 
                    fontWeight: '700',
                    color: chartData.summary.changePercent >= 0 ? theme.colors.green : theme.colors.red,
                    marginTop: 4,
                  }}>
                    {chartData.summary.changePercent >= 0 ? '+' : ''}
                    {chartData.summary.changePercent.toFixed(2)}%
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Statistics Card (if available) */}
          {statistics && (
            <View style={{
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius.xl,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
              ...theme.shadows.md,
            }}>
              <Text style={{ 
                ...theme.typography.h3, 
                color: theme.colors.black,
                marginBottom: theme.spacing.md,
              }}>
                {selectedPeriod} Statistics
              </Text>

              <View style={{ gap: theme.spacing.md }}>
                <StatRow label="Average Price" value={`₹${statistics.average.toFixed(2)}`} />
                <StatRow label="Volatility" value={`₹${statistics.volatility.toFixed(2)}`} />
                <StatRow label="Price Range" value={`₹${(statistics.high - statistics.low).toFixed(2)}`} />
              </View>
            </View>
          )}

          </View>
      </ScrollView>

    </View>
  );
};

// Helper Component
const StatRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    <Text style={{ ...theme.typography.body, color: theme.colors.gray600 }}>
      {label}
    </Text>
    <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.black }}>
      {value}
    </Text>
  </View>
);