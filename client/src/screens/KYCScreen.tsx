import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateUser } from '../store/authSlice';
import { Input } from '../components/Input';
import { kycService } from '../services';
import { theme } from '../theme';
import { useAlert } from '../contexts/AlertContext';
import { ModalAlert } from '../components/ModalAlert';

interface KYCScreenProps {
  navigation?: any;
}

export const KYCScreen: React.FC<KYCScreenProps> = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { showSuccess, showError } = useAlert();
  
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ pan: '', aadhaar: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validate = () => {
    let valid = true;
    const newErrors = { pan: '', aadhaar: '' };

    // PAN validation: 10 characters, format: ABCDE1234F
    if (!panNumber) {
      newErrors.pan = 'PAN number is required';
      valid = false;
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
      newErrors.pan = 'Invalid PAN format (e.g., ABCDE1234F)';
      valid = false;
    }

    // Aadhaar validation: 12 digits
    if (!aadhaarNumber) {
      newErrors.aadhaar = 'Aadhaar number is required';
      valid = false;
    } else if (!/^\d{12}$/.test(aadhaarNumber)) {
      newErrors.aadhaar = 'Aadhaar must be 12 digits';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showError('Invalid Input', 'Please check your PAN and Aadhaar details');
      return;
    }

    setLoading(true);
    try {
      await kycService.submitKYC(panNumber.toUpperCase(), aadhaarNumber);
      
      // Update user KYC status in Redux
      if (user) {
        dispatch(updateUser({ ...user, kycStatus: 'pending' }));
      }

      setLoading(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      setLoading(false);
      showError('Submission Failed', error.message || 'Failed to submit KYC. Please try again.');
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    
    // Simulate auto-verification after 5 seconds
    setTimeout(() => {
      if (user) {
        dispatch(updateUser({ ...user, kycStatus: 'verified' }));
        showSuccess('KYC Verified! 🎉', 'Your KYC has been verified successfully!');
      }
    }, 5000);
    
    navigation.goBack();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return theme.colors.green;
      case 'pending':
        return theme.colors.primary;
      case 'rejected':
        return theme.colors.red;
      default:
        return theme.colors.gray600;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return { name: 'checkmark-circle' as const, color: theme.colors.green };
      case 'pending':
        return { name: 'time' as const, color: theme.colors.primary };
      case 'rejected':
        return { name: 'close-circle' as const, color: theme.colors.red };
      default:
        return { name: 'alert-circle' as const, color: theme.colors.gray500 };
    }
  };

  const isKYCSubmitted = user?.kycStatus !== 'none';
  const statusIcon = getStatusIcon(user?.kycStatus || 'none');

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
              KYC Verification
            </Text>
          </View>
        </View>

        <View style={{ padding: theme.spacing.lg }}>
          {/* Status Card */}
          <View style={{
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            ...theme.shadows.md,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...theme.typography.small, color: theme.colors.gray600, marginBottom: theme.spacing.xs }}>
                  KYC Status
                </Text>
                <Text style={{ 
                  fontSize: 28,
                  fontWeight: '700',
                  color: getStatusColor(user?.kycStatus || 'none'),
                  textTransform: 'capitalize'
                }}>
                  {user?.kycStatus === 'none' ? 'Not Submitted' : user?.kycStatus}
                </Text>
              </View>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: statusIcon.color + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={statusIcon.name} size={32} color={statusIcon.color} />
              </View>
            </View>
          </View>

          {/* Info Card */}
          <View style={{
            backgroundColor: '#3B82F6' + '15',
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
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
                  Why KYC?
                </Text>
                <Text style={{ ...theme.typography.small, color: '#3B82F6', lineHeight: 20 }}>
                  KYC verification is mandatory for buying gold as per government regulations. 
                  It helps us ensure secure transactions and comply with legal requirements.
                </Text>
              </View>
            </View>
          </View>

          {!isKYCSubmitted ? (
            <>
              {/* KYC Form */}
              <View style={{ marginBottom: theme.spacing.lg }}>
                <Text style={{ ...theme.typography.h3, color: theme.colors.black, marginBottom: theme.spacing.lg }}>
                  Submit KYC Documents
                </Text>

                <Input
                  label="PAN Number"
                  value={panNumber}
                  onChangeText={(text) => {
                    setPanNumber(text.toUpperCase());
                    if (errors.pan) setErrors({ ...errors, pan: '' });
                  }}
                  placeholder="ABCDE1234F"
                  error={errors.pan}
                  icon="card-outline"
                />

                <Input
                  label="Aadhaar Number"
                  value={aadhaarNumber}
                  onChangeText={(text) => {
                    setAadhaarNumber(text);
                    if (errors.aadhaar) setErrors({ ...errors, aadhaar: '' });
                  }}
                  placeholder="123456789012"
                  keyboardType="numeric"
                  error={errors.aadhaar}
                  icon="finger-print"
                />

                <View style={{
                  backgroundColor: theme.colors.primary + '15',
                  borderRadius: theme.borderRadius.xl,
                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.lg,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={{
                      backgroundColor: theme.colors.primary + '25',
                      padding: theme.spacing.sm,
                      borderRadius: theme.borderRadius.md,
                      marginRight: theme.spacing.md,
                    }}>
                      <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ ...theme.typography.bodyBold, color: theme.colors.black, marginBottom: theme.spacing.xs }}>
                        Secure & Private
                      </Text>
                      <Text style={{ ...theme.typography.small, color: theme.colors.gray600, lineHeight: 20 }}>
                        Your documents are encrypted and stored securely. We never share your 
                        information with third parties.
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.borderRadius.xl,
                    paddingVertical: theme.spacing.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...theme.shadows.lg,
                    opacity: loading ? 0.5 : 1,
                  }}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ ...theme.typography.bodyBold, color: theme.colors.white, fontSize: 17, marginRight: theme.spacing.sm }}>
                        Submitting
                      </Text>
                      <Text style={{ ...theme.typography.bodyBold, color: theme.colors.white, fontSize: 17 }}>
                        ...
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ ...theme.typography.bodyBold, color: theme.colors.white, fontSize: 17 }}>
                      Submit KYC
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* KYC Submitted */}
              <View style={{
                backgroundColor: theme.colors.white,
                borderRadius: theme.borderRadius.xl,
                padding: theme.spacing.xl,
                marginBottom: theme.spacing.lg,
                ...theme.shadows.md,
              }}>
                <View style={{ alignItems: 'center', paddingVertical: theme.spacing.lg }}>
                  <View style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: statusIcon.color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.spacing.md,
                  }}>
                    <Ionicons name={statusIcon.name} size={48} color={statusIcon.color} />
                  </View>
                  <Text style={{ 
                    fontSize: 24,
                    fontWeight: '700',
                    color: theme.colors.black,
                    marginBottom: theme.spacing.sm
                  }}>
                    {user?.kycStatus === 'verified' && 'KYC Verified! ✅'}
                    {user?.kycStatus === 'pending' && 'KYC Under Review ⏳'}
                    {user?.kycStatus === 'rejected' && 'KYC Rejected ❌'}
                  </Text>
                  <Text style={{ 
                    ...theme.typography.body,
                    color: theme.colors.gray600,
                    textAlign: 'center',
                    marginTop: theme.spacing.xs,
                    paddingHorizontal: theme.spacing.lg,
                    lineHeight: 22
                  }}>
                    {user?.kycStatus === 'verified' &&
                      'Your KYC has been verified successfully. You can now buy and sell gold without any restrictions.'}
                    {user?.kycStatus === 'pending' &&
                      'Your KYC documents are being verified by our team. This usually takes 24-48 hours. You will be notified once verified.'}
                    {user?.kycStatus === 'rejected' &&
                      'Your KYC was rejected due to invalid or unclear documents. Please contact support for assistance.'}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              {user?.kycStatus === 'verified' && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('BuyGold')}
                  style={{
                    backgroundColor: theme.colors.green,
                    borderRadius: theme.borderRadius.xl,
                    paddingVertical: theme.spacing.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.spacing.md,
                    ...theme.shadows.lg,
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="diamond" size={20} color={theme.colors.white} />
                    <Text style={{ 
                      ...theme.typography.bodyBold, 
                      color: theme.colors.white, 
                      fontSize: 17,
                      marginLeft: theme.spacing.sm
                    }}>
                      Buy Gold
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {user?.kycStatus === 'rejected' && (
                <TouchableOpacity
                  onPress={() => {
                    if (user) {
                      dispatch(updateUser({ ...user, kycStatus: 'none' }));
                    }
                    setPanNumber('');
                    setAadhaarNumber('');
                    setErrors({ pan: '', aadhaar: '' });
                  }}
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.borderRadius.xl,
                    paddingVertical: theme.spacing.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.spacing.md,
                    ...theme.shadows.lg,
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="refresh" size={20} color={theme.colors.white} />
                    <Text style={{ 
                      ...theme.typography.bodyBold, 
                      color: theme.colors.white, 
                      fontSize: 17,
                      marginLeft: theme.spacing.sm
                    }}>
                      Resubmit KYC
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Requirements */}
          <View style={{
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.lg,
            ...theme.shadows.md,
          }}>
            <Text style={{ ...theme.typography.h3, color: theme.colors.black, marginBottom: theme.spacing.lg }}>
              Requirements
            </Text>
            <RequirementItem text="Valid PAN Card" />
            <RequirementItem text="Valid Aadhaar Card" />
            <RequirementItem text="Indian Resident" />
            <RequirementItem text="Age 18 or above" showBorder={false} />
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <ModalAlert
        type="success"
        title="KYC Submitted Successfully! ✅"
        message="Your KYC documents have been submitted for verification. You will be notified once verified.

(Demo: Auto-verification in 5 seconds)"
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        primaryButton={{
          label: 'Got it!',
          onPress: handleSuccessModalClose,
        }}
      />
    </View>
  );
};

interface RequirementItemProps {
  text: string;
  showBorder?: boolean;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ text, showBorder = true }) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: showBorder ? 1 : 0,
    borderBottomColor: theme.colors.gray100,
  }}>
    <View style={{
      backgroundColor: theme.colors.green + '20',
      padding: 4,
      borderRadius: 12,
      marginRight: theme.spacing.md,
    }}>
      <Ionicons name="checkmark" size={16} color={theme.colors.green} />
    </View>
    <Text style={{ ...theme.typography.body, color: theme.colors.black }}>
      {text}
    </Text>
  </View>
);