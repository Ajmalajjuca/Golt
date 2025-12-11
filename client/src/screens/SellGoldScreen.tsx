import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import { orderService, priceService, walletService } from '../services';
import { WalletData } from '../types';
import { theme } from '../theme';
import { useAlert } from '../contexts/AlertContext';
import { ModalAlert } from '../components/ModalAlert';

interface SellGoldScreenProps {
  navigation?: any;
}

const formatNumericInput = (text: string) => {
  let cleanedText = text.replace(/[^0-9.]/g, '');
  const parts = cleanedText.split('.');
  if (parts.length > 2) {
    cleanedText = parts[0] + '.' + parts.slice(1).join('');
  }
  return cleanedText;
};

export const SellGoldScreen: React.FC<SellGoldScreenProps> = () => {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector((state) => state.auth);
  const [goldGrams, setGoldGrams] = useState('');
  const [amountToReceive, setAmountToReceive] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const { showSuccess, showError, showAlert } = useAlert();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (goldGrams && sellPrice) {
      const cleanedGrams = goldGrams.replace(/[^0-9.]/g, '');
      const amount = parseFloat(cleanedGrams) * sellPrice;
      setAmountToReceive(isNaN(amount) ? 0 : amount);
    } else {
      setAmountToReceive(0);
    }
  }, [goldGrams, sellPrice]);

  const handleChangeGoldGrams = (text: string) => {
    setGoldGrams(formatNumericInput(text));
  };

  const loadData = async () => {
    try {
      const [priceResponse, walletResponse] = await Promise.all([
        priceService.getCurrentPrice(),
        walletService.getWallet(),
      ]);
      setSellPrice(priceResponse.data.sellPrice);
      setWalletData(walletResponse.data);
    } catch (error) {
      showError('Error', 'Failed to load data');
    }
  };

  const handleSell = () => {
    const cleanedGrams = goldGrams.replace(/[^0-9.]/g, '');
    const gramsNum = parseFloat(cleanedGrams);
    
    // Validation checks BEFORE showing confirmation
    if (!gramsNum || gramsNum <= 0) {
      showError('Invalid Amount', 'Please enter a valid gold quantity');
      return;
    }

    if (!walletData || gramsNum > walletData.goldBalance) {
      showError('Insufficient Balance', 'You do not have enough gold to sell');
      return;
    }

    // All validations passed, show confirmation modal
    setShowConfirm(true);
  };

  const confirmSell = async () => {
    const cleanedGrams = goldGrams.replace(/[^0-9.]/g, '');
    const gramsNum = parseFloat(cleanedGrams);

    setLoading(true);
    setShowConfirm(false); // Close modal first
    
    try {
      await orderService.initiateSell(gramsNum);
      
      // Show success alert
      showAlert({
        type: 'success',
        title: 'Sale Successful! 🎉',
        message: `You have successfully sold ${gramsNum.toFixed(4)}g of gold for ₹${amountToReceive.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
        duration: 0, // Don't auto-dismiss
        action: {
          label: 'View Wallet',
          onPress: () => {
            navigation.navigate('Wallet');
          },
        },
      });

      // Reset form
      setGoldGrams('');
      setAmountToReceive(0);
      
      // Reload wallet data
      await loadData();
      
    } catch (error: any) {
      showError('Sale Failed', error.message || 'Failed to sell gold. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickPercentages = [25, 50, 75, 100];

  const setPercentage = (percentage: number) => {
    if (walletData) {
      const grams = (walletData.goldBalance * percentage) / 100;
      setGoldGrams(grams.toFixed(4));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ 
          backgroundColor: theme.colors.white,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.gray100
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={{ marginRight: theme.spacing.md }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
            </TouchableOpacity>
            <Text style={{ ...theme.typography.h2, color: theme.colors.black }}>
              Sell Gold
            </Text>
          </View>
        </View>

        <View style={{ padding: theme.spacing.lg }}>
          {/* Current Price Card */}
          <View style={{
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            ...theme.shadows.md,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ ...theme.typography.small, color: theme.colors.gray500, marginBottom: theme.spacing.xs }}>
                  Current Sell Price
                </Text>
                <Text style={{ 
                  fontSize: 36,
                  fontWeight: '700',
                  color: theme.colors.red,
                  marginBottom: 2
                }}>
                  {sellPrice > 0 ? `₹${sellPrice.toLocaleString('en-IN')}` : 'Loading...'}
                </Text>
                <Text style={{ ...theme.typography.tiny, color: theme.colors.gray400 }}>
                  per gram
                </Text>
              </View>
              <TouchableOpacity 
                onPress={loadData}
                style={{
                  backgroundColor: theme.colors.red + '15',
                  padding: theme.spacing.md,
                  borderRadius: 50,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={24} color={theme.colors.red} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Available Balance Card */}
          <View style={{
            backgroundColor: theme.colors.primary + '15',
            borderRadius: theme.borderRadius.xl,
            borderWidth: 1,
            borderColor: theme.colors.primary + '40',
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
          }}>
            <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.black, marginBottom: theme.spacing.sm }}>
              Available Gold
            </Text>
            <Text style={{ 
              fontSize: 36,
              fontWeight: '700',
              color: theme.colors.primary,
              marginBottom: theme.spacing.xs
            }}>
              {walletData ? `${walletData.goldBalance.toFixed(4)}g` : '0g'}
            </Text>
            <Text style={{ ...theme.typography.small, color: theme.colors.gray500 }}>
              Worth ₹{walletData ? (walletData.goldBalance * sellPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'}
            </Text>
          </View>

          {/* Gold Input Field */}
          <View style={{ marginBottom: theme.spacing.lg }}>
            <Text style={{ ...theme.typography.bodyBold, color: theme.colors.black, marginBottom: theme.spacing.md }}>
              Enter Gold Quantity (grams)
            </Text>
            <View style={{
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius.xl,
              borderWidth: 2,
              borderColor: theme.colors.red,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              ...theme.shadows.sm,
            }}>
              <TextInput
                value={goldGrams}
                onChangeText={handleChangeGoldGrams}
                placeholder="0.0000"
                keyboardType="numeric"
                style={{ 
                  flex: 1,
                  fontSize: 28,
                  fontWeight: '700',
                  color: theme.colors.black,
                }}
                placeholderTextColor={theme.colors.gray300}
              />
              <Text style={{ fontSize: 24, color: theme.colors.gray400, marginLeft: theme.spacing.sm }}>
                g
              </Text>
            </View>
          </View>

          {/* Quick Percentage Buttons */}
          <View style={{ marginBottom: theme.spacing.lg }}>
            <Text style={{ ...theme.typography.bodyBold, color: theme.colors.black, marginBottom: theme.spacing.md }}>
              Quick Select
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -theme.spacing.xs }}>
              {quickPercentages.map((percentage) => (
                <TouchableOpacity
                  key={percentage}
                  onPress={() => setPercentage(percentage)}
                  style={{
                    backgroundColor: theme.colors.white,
                    borderWidth: 1,
                    borderColor: theme.colors.gray200,
                    borderRadius: theme.borderRadius.lg,
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.md,
                    marginRight: theme.spacing.sm,
                    marginBottom: theme.spacing.sm,
                    ...theme.shadows.sm,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.black }}>
                    {percentage}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Calculation Summary */}
          {amountToReceive > 0 && (
            <View style={{
              backgroundColor: theme.colors.green + '15',
              borderRadius: theme.borderRadius.xl,
              borderWidth: 1,
              borderColor: theme.colors.green + '40',
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: theme.spacing.md,
                paddingBottom: theme.spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.green + '30',
              }}>
                <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.black }}>
                  You will receive
                </Text>
                <Text style={{ 
                  fontSize: 28,
                  fontWeight: '700',
                  color: theme.colors.green,
                }}>
                  ₹{amountToReceive.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Text>
              </View>
              
              <View style={{ gap: theme.spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ ...theme.typography.body, color: theme.colors.gray600 }}>
                    Gold quantity
                  </Text>
                  <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.black }}>
                    {goldGrams}g
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ ...theme.typography.body, color: theme.colors.gray600 }}>
                    Price per gram
                  </Text>
                  <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.black }}>
                    ₹{sellPrice.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ ...theme.typography.body, color: theme.colors.gray600 }}>
                    Total amount
                  </Text>
                  <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.black }}>
                    ₹{amountToReceive.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Sell Button */}
          <TouchableOpacity
            onPress={handleSell}
            disabled={loading || !goldGrams || parseFloat(goldGrams.replace(/[^0-9.]/g, '')) <= 0}
            style={{
              backgroundColor: theme.colors.red,
              borderRadius: theme.borderRadius.xl,
              paddingVertical: theme.spacing.lg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.lg,
              ...theme.shadows.lg,
              opacity: (loading || !goldGrams || parseFloat(goldGrams.replace(/[^0-9.]/g, '')) <= 0) ? 0.5 : 1,
            }}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text style={{ ...theme.typography.bodyBold, color: theme.colors.white }}>
                Processing...
              </Text>
            ) : (
              <Text style={{ ...theme.typography.bodyBold, color: theme.colors.white, fontSize: 17 }}>
                Sell {goldGrams || '0'}g Gold
              </Text>
            )}
          </TouchableOpacity>

          {/* Info Section */}
          <View style={{
            backgroundColor: '#3B82F6' + '15',
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.lg,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{
                backgroundColor: '#3B82F6' + '25',
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.md,
                marginRight: theme.spacing.md,
              }}>
                <Ionicons name="information-circle" size={24} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...theme.typography.bodyBold, color: '#1E40AF', marginBottom: theme.spacing.xs }}>
                  How it works
                </Text>
                <Text style={{ ...theme.typography.small, color: '#3B82F6', lineHeight: 20 }}>
                  1. Enter the gold quantity you want to sell{'\n'}
                  2. Review the amount you'll receive{'\n'}
                  3. Confirm the sale{'\n'}
                  4. Money will be added to your wallet instantly
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ModalAlert
        type="warning"
        title="Confirm Sale"
        message={`Are you sure you want to sell ${goldGrams}g of gold for ₹${amountToReceive.toLocaleString('en-IN', { maximumFractionDigits: 2 })}?`}
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        primaryButton={{
          label: 'Confirm Sale',
          onPress: confirmSell,
        }}
        secondaryButton={{
          label: 'Cancel',
          onPress: () => setShowConfirm(false),
        }}
      />
    </View>
  );
};