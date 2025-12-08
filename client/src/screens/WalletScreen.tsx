import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { walletService } from '../services';
import { WalletData, Transaction } from '../types';
import { theme } from '../theme';

interface WalletScreenProps {
  navigation: any;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ navigation }) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walletResponse, transactionsResponse] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions(1, 10),
      ]);
      setWalletData(walletResponse.data);
      setTransactions(transactionsResponse.data.transactions);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy_gold':
        return { name: 'arrow-down-circle' as const, color: theme.colors.green };
      case 'sell_gold':
        return { name: 'arrow-up-circle' as const, color: theme.colors.red };
      case 'deposit':
        return { name: 'add-circle' as const, color: '#3B82F6' };
      case 'withdrawal':
        return { name: 'remove-circle' as const, color: theme.colors.primary };
      default:
        return { name: 'swap-horizontal' as const, color: theme.colors.gray500 };
    }
  };

  const getTransactionTitle = (type: string) => {
    switch (type) {
      case 'buy_gold':
        return 'Bought Gold';
      case 'sell_gold':
        return 'Sold Gold';
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'refund':
        return 'Refund';
      default:
        return 'Transaction';
    }
  };

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
          backgroundColor: theme.colors.white,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.gray100
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={{ marginRight: theme.spacing.md }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
              </TouchableOpacity>
              <Text style={{ ...theme.typography.h2, color: theme.colors.black }}>
                Wallet
              </Text>
            </View>
          </View>
        </View>

        <View style={{ padding: theme.spacing.lg }}>
          {/* Balance Cards */}
          <View style={{ 
            flexDirection: 'row', 
            marginBottom: theme.spacing.lg,
            gap: theme.spacing.md 
          }}>
            {/* Cash Balance */}
            <View style={{ flex: 1 }}>
              <View style={{
                backgroundColor: theme.colors.green + '15',
                borderRadius: theme.borderRadius.xl,
                borderWidth: 1,
                borderColor: theme.colors.green + '40',
                padding: theme.spacing.lg,
                
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs }}>
                  <View style={{
                    backgroundColor: theme.colors.green + '30',
                    padding: 6,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.sm,
                  }}>
                    <Ionicons name="wallet" size={16} color={theme.colors.green} />
                  </View>
                  <Text style={{ ...theme.typography.small, color: theme.colors.gray600 }}>
                    Cash
                  </Text>
                </View>
                <Text style={{ 
                  fontSize: 24,
                  fontWeight: '700',
                  color: theme.colors.green
                }}>
                  {walletData ? formatCurrency(walletData.walletBalance) : '₹0'}
                </Text>
              </View>
            </View>

            {/* Gold Balance */}
            <View style={{ flex: 1 }}>
              <View style={{
                backgroundColor: theme.colors.primary + '15',
                borderRadius: theme.borderRadius.xl,
                borderWidth: 1,
                borderColor: theme.colors.primary + '40',
                padding: theme.spacing.lg,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs }}>
                  <View style={{
                    backgroundColor: theme.colors.primary + '30',
                    padding: 6,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.sm,
                  }}>
                    <Ionicons name="diamond" size={16} color={theme.colors.primary} />
                  </View>
                  <Text style={{ ...theme.typography.small, color: theme.colors.gray600 }}>
                    Gold
                  </Text>
                </View>
                <Text style={{ 
                  fontSize: 24,
                  fontWeight: '700',
                  color: theme.colors.primary
                }}>
                  {walletData ? `${walletData.goldBalance.toFixed(4)}g` : '0g'}
                </Text>
              </View>
            </View>
          </View>

          {/* Portfolio Stats */}
          {walletData && (
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
                marginBottom: theme.spacing.lg
              }}>
                Portfolio Summary
              </Text>
              
              <View style={{ gap: theme.spacing.md }}>
                <StatRow
                  label="Total Invested"
                  value={formatCurrency(walletData.totalInvested)}
                />
                <StatRow
                  label="Current Value"
                  value={formatCurrency(walletData.currentValue)}
                />
                <StatRow
                  label="Average Buy Price"
                  value={`${formatCurrency(walletData.avgBuyPrice)}/g`}
                />
                
                <View style={{
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.gray100,
                  paddingTop: theme.spacing.md,
                  marginTop: theme.spacing.sm,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ ...theme.typography.body, color: theme.colors.gray600 }}>
                      Profit/Loss
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        backgroundColor: walletData.profitLoss >= 0 
                          ? theme.colors.green + '20' 
                          : theme.colors.red + '20',
                        padding: 4,
                        borderRadius: theme.borderRadius.sm,
                        marginRight: theme.spacing.xs,
                      }}>
                        <Ionicons
                          name={walletData.profitLoss >= 0 ? 'trending-up' : 'trending-down'}
                          size={16}
                          color={walletData.profitLoss >= 0 ? theme.colors.green : theme.colors.red}
                        />
                      </View>
                      <Text
                        style={{
                          ...theme.typography.bodyBold,
                          color: walletData.profitLoss >= 0 ? theme.colors.green : theme.colors.red,
                        }}
                      >
                        {walletData.profitLoss >= 0 ? '+' : ''}
                        {formatCurrency(walletData.profitLoss)} (
                        {walletData.profitLossPercentage.toFixed(2)}%)
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Recent Transactions */}
          <View>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: theme.spacing.md
            }}>
              <Text style={{ 
                ...theme.typography.h3,
                color: theme.colors.black
              }}>
                Recent Transactions
              </Text>
            </View>
            
            {transactions.length > 0 ? (
              <View style={{
                backgroundColor: theme.colors.white,
                borderRadius: theme.borderRadius.xl,
                overflow: 'hidden',
                ...theme.shadows.md,
              }}>
                {transactions.map((transaction, index) => {
                  const icon = getTransactionIcon(transaction.type);
                  return (
                    <View
                      key={transaction._id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: theme.spacing.lg,
                        borderBottomWidth: index < transactions.length - 1 ? 1 : 0,
                        borderBottomColor: theme.colors.gray100,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: icon.color + '20',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: theme.spacing.md,
                        }}
                      >
                        <Ionicons name={icon.name} size={20} color={icon.color} />
                      </View>
                      
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          ...theme.typography.body,
                          fontWeight: '600',
                          color: theme.colors.black,
                          marginBottom: 2
                        }}>
                          {getTransactionTitle(transaction.type)}
                        </Text>
                        <Text style={{ ...theme.typography.small, color: theme.colors.gray500 }}>
                          {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text
                          style={{
                            ...theme.typography.bodyBold,
                            color: transaction.type === 'buy_gold' ? theme.colors.red : theme.colors.green,
                            marginBottom: 2
                          }}
                        >
                          {transaction.type === 'buy_gold' ? '-' : '+'}
                          {formatCurrency(transaction.amount)}
                        </Text>
                        <View style={{
                          paddingHorizontal: theme.spacing.sm,
                          paddingVertical: 2,
                          borderRadius: theme.borderRadius.sm,
                          backgroundColor: 
                            transaction.status === 'success'
                              ? theme.colors.green + '20'
                              : transaction.status === 'failed'
                              ? theme.colors.red + '20'
                              : theme.colors.primary + '20',
                        }}>
                          <Text
                            style={{
                              ...theme.typography.tiny,
                              fontWeight: '600',
                              color:
                                transaction.status === 'success'
                                  ? theme.colors.green
                                  : transaction.status === 'failed'
                                  ? theme.colors.red
                                  : theme.colors.primary,
                              textTransform: 'capitalize',
                            }}
                          >
                            {transaction.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={{
                backgroundColor: theme.colors.white,
                borderRadius: theme.borderRadius.xl,
                padding: theme.spacing.xxl,
                alignItems: 'center',
                ...theme.shadows.md,
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: theme.colors.gray100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.spacing.md,
                }}>
                  <Ionicons name="receipt-outline" size={40} color={theme.colors.gray400} />
                </View>
                <Text style={{ 
                  ...theme.typography.body,
                  color: theme.colors.gray500,
                  marginBottom: theme.spacing.sm
                }}>
                  No transactions yet
                </Text>
                <Text style={{ 
                  ...theme.typography.small,
                  color: theme.colors.gray400,
                  textAlign: 'center'
                }}>
                  Start investing in gold to see{'\n'}your transaction history
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

interface StatRowProps {
  label: string;
  value: string;
}

const StatRow: React.FC<StatRowProps> = ({ label, value }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    <Text style={{ ...theme.typography.body, color: theme.colors.gray600 }}>
      {label}
    </Text>
    <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.black }}>
      {value}
    </Text>
  </View>
);