import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import { Card } from '../components/Card'; 
import { Button } from '../components/Button';
import { orderService, priceService } from '../services';
import { theme } from '../theme';

interface BuyGoldScreenProps {
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

export const BuyGoldScreen: React.FC<BuyGoldScreenProps> = () => {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector((state) => state.auth);
  
  const [amount, setAmount] = useState('');
  const [goldGrams, setGoldGrams] = useState(0);
  const [buyPrice, setBuyPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPrice();
  }, []);

  useEffect(() => {
    if (!buyPrice || !amount) {
      setGoldGrams(0);
      return;
    }
    
    const cleanedAmount = amount.replace(/[^0-9.]/g, ''); 
    const grams = parseFloat(cleanedAmount) / buyPrice;
    setGoldGrams(isNaN(grams) || !isFinite(grams) ? 0 : grams);
  }, [amount, buyPrice]);

  const handleChangeAmount = (text: string) => {
    setAmount(formatNumericInput(text));
  };

  const loadPrice = async () => {
    try {
      const response = await priceService.getLivePrice();
      setBuyPrice(response.data.buyPrice);
    } catch (error) {
      Alert.alert('Error', 'Failed to load price');
    }
  };
  
  const handleBuy = async () => {
    const cleanedAmount = amount.replace(/[^0-9.]/g, '');
    const amountNum = parseFloat(cleanedAmount);
    
    if (isNaN(amountNum) || amountNum < 100) {
      Alert.alert('Invalid Amount', 'Minimum purchase amount is ₹100');
      return;
    }
    
    if (buyPrice <= 0) {
      Alert.alert('Price Not Available', 'The live gold price has not loaded yet. Please wait or tap refresh.');
      return;
    }

    if (user?.kycStatus !== 'verified') {
      Alert.alert(
        'KYC Required',
        'Please complete KYC verification before buying gold',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Complete KYC', 
            onPress: () => navigation.navigate('KYC')
          },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const response = await orderService.initiateBuy(amountNum);
      
      Alert.alert(
        'Payment',
        'In production, Razorpay payment gateway will open here. For now, simulating payment success...',
        [
          {
            text: 'OK',
            onPress: async () => {
              try {
                await orderService.verifyPayment(
                  response.data.order._id,
                  'mock_payment_id',
                  'mock_signature'
                );
                
                Alert.alert(
                  'Success! 🎉',
                  `You have successfully purchased ${goldGrams.toFixed(4)}g of gold!`,
                  [{ 
                    text: 'OK', 
                    onPress: () => navigation.goBack()
                  }]
                );
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Payment verification failed');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initiate purchase');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000];

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
              Buy Gold
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
                  Current Buy Price
                </Text>
                <Text style={{ 
                  fontSize: 36,
                  fontWeight: '700',
                  color: theme.colors.green,
                  marginBottom: 2
                }}>
                  {buyPrice > 0 ? `₹${buyPrice.toLocaleString('en-IN')}` : 'Loading...'}
                </Text>
                <Text style={{ ...theme.typography.tiny, color: theme.colors.gray400 }}>
                  per gram
                </Text>
              </View>
              <TouchableOpacity 
                onPress={loadPrice}
                style={{
                  backgroundColor: theme.colors.green + '15',
                  padding: theme.spacing.md,
                  borderRadius: 50,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={24} color={theme.colors.green} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Input Field */}
          <View style={{ marginBottom: theme.spacing.lg }}>
            <Text style={{ ...theme.typography.bodyBold, color: theme.colors.black, marginBottom: theme.spacing.md }}>
              Enter Amount (₹)
            </Text>
            <View style={{
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius.xl,
              borderWidth: 2,
              borderColor: theme.colors.primary,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              ...theme.shadows.sm,
            }}>
              <Text style={{ fontSize: 28, color: theme.colors.gray400, marginRight: theme.spacing.sm }}>
                ₹
              </Text>
              <TextInput
                value={amount}
                onChangeText={handleChangeAmount}
                placeholder="0"
                keyboardType="numeric"
                style={{ 
                  flex: 1,
                  fontSize: 28,
                  fontWeight: '700',
                  color: theme.colors.black,
                }}
                placeholderTextColor={theme.colors.gray300}
              />
            </View>
            <Text style={{ ...theme.typography.small, color: theme.colors.gray400, marginTop: theme.spacing.sm }}>
              Minimum: ₹100
            </Text>
          </View>

          {/* Quick Amount Buttons */}
          <View style={{ marginBottom: theme.spacing.lg }}>
            <Text style={{ ...theme.typography.bodyBold, color: theme.colors.black, marginBottom: theme.spacing.md }}>
              Quick Select
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -theme.spacing.xs }}>
              {quickAmounts.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setAmount(amt.toString())}
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
                    ₹{amt.toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Calculation Summary */}
          {goldGrams > 0 && (
            <View style={{
              backgroundColor: theme.colors.primary + '15',
              borderRadius: theme.borderRadius.xl,
              borderWidth: 1,
              borderColor: theme.colors.primary + '40',
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
                borderBottomColor: theme.colors.primary + '30',
              }}>
                <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.black }}>
                  You will receive
                </Text>
                <Text style={{ 
                  fontSize: 28,
                  fontWeight: '700',
                  color: theme.colors.primary,
                }}>
                  {goldGrams.toFixed(4)}g
                </Text>
              </View>
              
              <View style={{ gap: theme.spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ ...theme.typography.body, color: theme.colors.gray600 }}>
                    Amount
                  </Text>
                  <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.black }}>
                    ₹{parseFloat(amount || '0').toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ ...theme.typography.body, color: theme.colors.gray600 }}>
                    Price per gram
                  </Text>
                  <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.black }}>
                    ₹{buyPrice.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ ...theme.typography.body, color: theme.colors.gray600 }}>
                    Gold quantity
                  </Text>
                  <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.black }}>
                    {goldGrams.toFixed(4)}g
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Buy Button */}
          <TouchableOpacity
            onPress={handleBuy}
            disabled={loading || !amount || parseFloat(amount.replace(/[^0-9.]/g, '')) < 100 || buyPrice <= 0}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.xl,
              paddingVertical: theme.spacing.lg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.lg,
              ...theme.shadows.lg,
              opacity: (loading || !amount || parseFloat(amount.replace(/[^0-9.]/g, '')) < 100 || buyPrice <= 0) ? 0.5 : 1,
            }}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text style={{ ...theme.typography.bodyBold, color: theme.colors.white }}>
                Processing...
              </Text>
            ) : (
              <Text style={{ ...theme.typography.bodyBold, color: theme.colors.white, fontSize: 17 }}>
                Buy Gold for ₹{amount || '0'}
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
                  1. Enter the amount you want to invest{'\n'}
                  2. Review the gold quantity you'll receive{'\n'}
                  3. Complete payment via Razorpay{'\n'}
                  4. Gold will be added to your wallet instantly
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};