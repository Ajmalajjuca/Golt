import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../store/hooks';
import { TransactionItem } from '../components/TransactionItem';
import { walletService } from '../services';
import { Transaction } from '../types';
import { theme } from '../theme';

interface TransactionsScreenProps {
  navigation: any;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');

  React.useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await walletService.getTransactions(1, 50);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  console.log('transaction:',transactions);
  

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const isNegative = ['buy_gold', 'buy_silver', 'withdrawal'].includes(transaction.type);
    return `${isNegative ? '-' : '+'}${formatCurrency(transaction.amount)}`;
  };

  const getTransactionDate = (date: string) => {
    const transactionDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (transactionDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (transactionDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return transactionDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const getFilteredTransactions = () => {
    if (filter === 'all') return transactions;
    if (filter === 'buy') return transactions.filter(t => t.type === 'buy_gold' || t.type === 'buy_silver');
    if (filter === 'sell') return transactions.filter(t => t.type === 'sell_gold' || t.type === 'sell_silver');
    return transactions;
  };

  const filteredTransactions = getFilteredTransactions();

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups: any, transaction) => {
    const date = getTransactionDate(transaction.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
              Transactions
            </Text>
          </View>
          
          {/* Summary Badge */}
          {transactions.length > 0 && (
            <View style={{
              backgroundColor: theme.colors.primary + '20',
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.borderRadius.lg,
            }}>
              <Text style={{ 
                ...theme.typography.small,
                color: theme.colors.primary,
                fontWeight: '600'
              }}>
                {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
              </Text>
            </View>
          )}
        </View>

        {/* Filter Tabs */}
        {transactions.length > 0 && (
          <View style={{
            flexDirection: 'row',
            marginTop: theme.spacing.lg,
            gap: theme.spacing.sm,
          }}>
            <FilterTab
              label="All"
              isActive={filter === 'all'}
              onPress={() => setFilter('all')}
              count={transactions.length}
            />
            <FilterTab
              label="Buy"
              isActive={filter === 'buy'}
              onPress={() => setFilter('buy')}
              count={transactions.filter(t => t.type === 'buy_gold' || t.type === 'buy_silver').length}
            />
            <FilterTab
              label="Sell"
              isActive={filter === 'sell'}
              onPress={() => setFilter('sell')}
              count={transactions.filter(t => t.type === 'sell_gold' || t.type === 'sell_silver').length}
            />
          </View>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing.lg }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ paddingVertical: theme.spacing.xxl, alignItems: 'center' }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.md,
            }}>
              <Ionicons name="hourglass-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={{ ...theme.typography.body, color: theme.colors.gray500 }}>
              Loading transactions...
            </Text>
          </View>
        ) : filteredTransactions.length > 0 ? (
          <>
            {Object.keys(groupedTransactions).map((date, groupIndex) => (
              <View key={date} style={{ marginBottom: theme.spacing.lg }}>
                {/* Date Header */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: theme.spacing.sm,
                }}>
                  <View style={{ 
                    flex: 1, 
                    height: 1, 
                    backgroundColor: theme.colors.gray200 
                  }} />
                  <Text style={{
                    ...theme.typography.small,
                    color: theme.colors.gray500,
                    fontWeight: '600',
                    marginHorizontal: theme.spacing.md,
                  }}>
                    {date}
                  </Text>
                  <View style={{ 
                    flex: 1, 
                    height: 1, 
                    backgroundColor: theme.colors.gray200 
                  }} />
                </View>

                {/* Transactions Card */}
                <View
                  style={{
                    backgroundColor: theme.colors.white,
                    borderRadius: theme.borderRadius.xl,
                    overflow: 'hidden',
                    ...theme.shadows.md,
                  }}
                >
                  {groupedTransactions[date].map((transaction: Transaction, index: number) => (
                    <View key={transaction._id}>
                      <TransactionItem
                        type={transaction.type as any}
                        amount={`${((transaction as any).quantity || (transaction as any).goldAmount || 0).toFixed(4)}g`}
                        date={new Date(transaction.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        value={getTransactionAmount(transaction)}
                      />
                      {index < groupedTransactions[date].length - 1 && (
                        <View style={{
                          height: 1,
                          backgroundColor: theme.colors.gray100,
                          marginLeft: theme.spacing.lg,
                        }} />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        ) : (
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius.xl,
              padding: theme.spacing.xxl,
              alignItems: 'center',
              ...theme.shadows.md,
            }}
          >
            <View style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: theme.colors.gray100,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.lg,
            }}>
              <Ionicons name="receipt-outline" size={48} color={theme.colors.gray400} />
            </View>
            <Text
              style={{
                ...theme.typography.h3,
                color: theme.colors.black,
                marginBottom: theme.spacing.sm,
              }}
            >
              {filter === 'all' ? 'No Transactions Yet' : `No ${filter} transactions`}
            </Text>
            <Text
              style={{
                ...theme.typography.body,
                color: theme.colors.gray500,
                textAlign: 'center',
                lineHeight: 22,
              }}
            >
              {filter === 'all' 
                ? 'Your transaction history will appear here'
                : `You haven't made any ${filter} transactions yet`
              }
            </Text>

            {filter === 'all' && (
              <TouchableOpacity
                onPress={() => navigation.navigate('BuyGold')}
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.xl,
                  paddingHorizontal: theme.spacing.xl,
                  paddingVertical: theme.spacing.md,
                  marginTop: theme.spacing.lg,
                  ...theme.shadows.sm,
                }}
                activeOpacity={0.8}
              >
                <Text style={{ 
                  ...theme.typography.bodyBold,
                  color: theme.colors.white 
                }}>
                  Buy Gold Now
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

interface FilterTabProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  count: number;
}

const FilterTab: React.FC<FilterTabProps> = ({ label, isActive, onPress, count }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flex: 1,
      backgroundColor: isActive ? theme.colors.primary : theme.colors.white,
      borderWidth: 1,
      borderColor: isActive ? theme.colors.primary : theme.colors.gray200,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...(!isActive && theme.shadows.sm),
    }}
    activeOpacity={0.7}
  >
    <Text style={{
      ...theme.typography.body,
      fontWeight: '600',
      color: isActive ? theme.colors.white : theme.colors.black,
    }}>
      {label}
    </Text>
    {count > 0 && (
      <View style={{
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.3)' : theme.colors.gray200,
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: 2,
        marginLeft: theme.spacing.xs,
        minWidth: 20,
        alignItems: 'center',
      }}>
        <Text style={{
          ...theme.typography.tiny,
          fontWeight: '700',
          color: isActive ? theme.colors.white : theme.colors.gray600,
        }}>
          {count}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);