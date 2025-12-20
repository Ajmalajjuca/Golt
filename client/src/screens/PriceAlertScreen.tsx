import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { MetalToggle } from '../components/MetalToggle';
import { ModalAlert } from '../components/ModalAlert';
import { NotificationService } from '../services/notificationService';
import axios from 'axios';
import { useAppSelector } from '../store/hooks';
import { selectToken } from '../store/authSlice';
import { API_BASE_URL } from '../constants';

type MetalType = 'gold' | 'silver';
type Frequency = 'once' | 'recurring';

export const PriceAlertScreen: React.FC = () => {
  const navigation = useNavigation();
  const token = useAppSelector(selectToken);
  
  const [metalType, setMetalType] = useState<MetalType>('gold');
  const [targetPrice, setTargetPrice] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('once');
  const [loading, setLoading] = useState(false);
  const [permLoading, setPermLoading] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);
  
  // Modal alert states
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    onPrimaryPress?: () => void;
  }>({
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const token = await NotificationService.registerForPushNotifications();
      if (token) {
        setPushToken(token);
      } else {
        // Alert.alert('Permission Required', 'Please enable push notifications to receive alerts.');
      }
    } catch (error) {
      console.error('Error getting push token:', error);
    } finally {
      setPermLoading(false);
    }
  };

  const handleSetAlert = async () => {
    if (!targetPrice) {
      setModalConfig({
        type: 'error',
        title: 'Missing Information',
        message: 'Please enter a target price'
      });
      setShowModal(true);
      return;
    }

    if (!pushToken) {
      setModalConfig({
        type: 'warning',
        title: 'Notifications Disabled',
        message: 'We cannot send you alerts without push notification permission. Please enable it in settings.'
      });
      setShowModal(true);
      // Try to register again
      const token = await NotificationService.registerForPushNotifications();
      if (token) setPushToken(token);
      else return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/alerts`,
        {
          metalType,
          targetPrice: parseFloat(targetPrice),
          frequency,
          pushToken // Send token to ensure backend has it
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setModalConfig({
          type: 'success',
          title: 'Alert Set Successfully',
          message: `You'll be notified when ${metalType} reaches ₹${targetPrice}`,
          onPrimaryPress: () => navigation.goBack()
        });
        setShowModal(true);
      }
    } catch (error: any) {
      console.error('Create alert error:', error.response?.data || error.message);
      setModalConfig({
        type: 'error',
        title: 'Failed to Set Alert',
        message: error.response?.data?.message || 'Something went wrong. Please try again.'
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header */}
          <View style={{ 
            padding: theme.spacing.lg,
            paddingTop: theme.spacing.xl,
            backgroundColor: theme.colors.white,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.gray100
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 20,
                  backgroundColor: theme.colors.gray100,
                  marginRight: theme.spacing.md
                }}
              >
                <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
              </TouchableOpacity>
              <Text style={{ ...theme.typography.h2, color: theme.colors.black }}>
                Price Alert
              </Text>
            </View>
          </View>

          <View style={{ padding: theme.spacing.lg }}>
            <Text style={{ 
              ...theme.typography.body, 
              color: theme.colors.gray500,
              marginBottom: theme.spacing.xl 
            }}>
              Get notified when metal prices reach your target.
            </Text>

            {/* Metal Selection */}
            <Text style={{ ...theme.typography.h3, marginBottom: theme.spacing.md }}>
              Select Metal
            </Text>
            <View style={{ marginBottom: theme.spacing.xl }}>
              <MetalToggle 
                selectedMetal={metalType} 
                onSelect={setMetalType} 
              />
            </View>

            {/* Target Price */}
            <Text style={{ ...theme.typography.h3, marginBottom: theme.spacing.md }}>
              Target Price (₹)
            </Text>
            <TextInput
              value={targetPrice}
              onChangeText={setTargetPrice}
              placeholder="Enter target price"
              keyboardType="numeric"
              style={{
                backgroundColor: theme.colors.white,
                padding: theme.spacing.lg,
                borderRadius: theme.borderRadius.lg,
                fontSize: 18,
                borderWidth: 1,
                borderColor: theme.colors.gray200,
                marginBottom: theme.spacing.xl,
                color: theme.colors.black
              }}
            />

            {/* Frequency Selection */}
            <Text style={{ ...theme.typography.h3, marginBottom: theme.spacing.md }}>
              Frequency
            </Text>
            <View style={{ marginBottom: theme.spacing.xxxl }}>
              <TouchableOpacity
                onPress={() => setFrequency('once')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.white,
                  padding: theme.spacing.lg,
                  borderRadius: theme.borderRadius.lg,
                  marginBottom: theme.spacing.sm,
                  borderWidth: frequency === 'once' ? 2 : 1,
                  borderColor: frequency === 'once' ? theme.colors.primary : theme.colors.gray200
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: frequency === 'once' ? theme.colors.primary : theme.colors.gray400,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: theme.spacing.md
                }}>
                  {frequency === 'once' && (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary }} />
                  )}
                </View>
                <View>
                  <Text style={{ ...theme.typography.bodyBold, color: theme.colors.black }}>Notify Once</Text>
                  <Text style={{ ...theme.typography.small, color: theme.colors.gray500 }}>Alert me one time only</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFrequency('recurring')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.white,
                  padding: theme.spacing.lg,
                  borderRadius: theme.borderRadius.lg,
                  borderWidth: frequency === 'recurring' ? 2 : 1,
                  borderColor: frequency === 'recurring' ? theme.colors.primary : theme.colors.gray200
                }}
              >
                 <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: frequency === 'recurring' ? theme.colors.primary : theme.colors.gray400,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: theme.spacing.md
                }}>
                  {frequency === 'recurring' && (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary }} />
                  )}
                </View>
                <View>
                  <Text style={{ ...theme.typography.bodyBold, color: theme.colors.black }}>Notify Every Day</Text>
                  <Text style={{ ...theme.typography.small, color: theme.colors.gray500 }}>Remind me if condition is met (max once/hour)</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Set Alert Button */}
            <TouchableOpacity
              onPress={handleSetAlert}
              disabled={loading || permLoading}
              style={{
                backgroundColor: loading || permLoading ? theme.colors.gray400 : theme.colors.primary,
                padding: theme.spacing.lg,
                borderRadius: theme.borderRadius.lg,
                alignItems: 'center',
                ...theme.shadows.md
              }}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={{ ...theme.typography.h3, color: theme.colors.white }}>
                  Set Alert
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <ModalAlert
        visible={showModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setShowModal(false)}
        primaryButton={{
          label: 'OK',
          onPress: modalConfig.onPrimaryPress || (() => {})
        }}
      />
    </View>
  );
};
