import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, updateUser } from '../store/authSlice';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { theme } from '../theme';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (user) {
        dispatch(updateUser({ ...user, ...formData }));
      }
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          },
        },
      ]
    );
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return { bg: theme.colors.green + '15', border: theme.colors.green };
      case 'pending':
        return { bg: theme.colors.primary + '15', border: theme.colors.primary };
      case 'rejected':
        return { bg: theme.colors.red + '15', border: theme.colors.red };
      default:
        return { bg: theme.colors.gray200, border: theme.colors.gray400 };
    }
  };

  const getKYCStatusTextColor = (status: string) => {
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

  const kycColors = getKYCStatusColor(user?.kycStatus || 'none');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ 
          backgroundColor: theme.colors.white,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.md,
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
                Profile
              </Text>
            </View>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.7}>
                <View style={{
                  backgroundColor: theme.colors.primary + '20',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                }}>
                  <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ padding: theme.spacing.md, paddingBottom: theme.spacing.xxl }}>
          {/* Avatar */}
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl }}>
            <View style={{
              width: 96,
              height: 96,
              backgroundColor: theme.colors.primary,
              borderRadius: 48,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.md,
              ...theme.shadows.lg,
            }}>
              <Text style={{ 
                color: theme.colors.white,
                fontSize: 40,
                fontWeight: '700'
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={{ 
              fontSize: 28,
              fontWeight: '700',
              color: theme.colors.black,
              marginBottom: theme.spacing.xs
            }}>
              {user?.name}
            </Text>
            <Text style={{ ...theme.typography.body, color: theme.colors.gray500 }}>
              {user?.email}
            </Text>
          </View>

          {/* KYC Status */}
          <View style={{
            backgroundColor: kycColors.bg,
            borderRadius: theme.borderRadius.xl,
            borderWidth: 2,
            borderColor: kycColors.border,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{
                  backgroundColor: kycColors.border + '30',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  marginRight: theme.spacing.md,
                }}>
                  <Ionicons
                    name={user?.kycStatus === 'verified' ? 'shield-checkmark' : 'shield-outline'}
                    size={24}
                    color={kycColors.border}
                  />
                </View>
                <View>
                  <Text style={{ ...theme.typography.small, color: theme.colors.gray600 }}>
                    KYC Status
                  </Text>
                  <Text style={{ 
                    ...theme.typography.bodyBold,
                    color: getKYCStatusTextColor(user?.kycStatus || 'none'),
                    textTransform: 'capitalize'
                  }}>
                    {user?.kycStatus === 'none' ? 'Not Submitted' : user?.kycStatus}
                  </Text>
                </View>
              </View>
              {user?.kycStatus !== 'verified' && (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('KYC')}
                  activeOpacity={0.7}
                >
                  <Text style={{ 
                    ...theme.typography.bodyBold,
                    color: theme.colors.primary
                  }}>
                    Complete
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Profile Information */}
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
              {isEditing ? 'Edit Profile' : 'Personal Information'}
            </Text>

            {isEditing ? (
              <>
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter your name"
                  icon="person-outline"
                />
                <Input
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  icon="mail-outline"
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Enter your phone"
                  keyboardType="phone-pad"
                  icon="call-outline"
                />

                <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                        });
                      }}
                      style={{
                        backgroundColor: theme.colors.white,
                        borderWidth: 2,
                        borderColor: theme.colors.gray300,
                        borderRadius: theme.borderRadius.xl,
                        paddingVertical: theme.spacing.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={{ ...theme.typography.bodyBold, color: theme.colors.black }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity
                      onPress={handleSave}
                      disabled={loading}
                      style={{
                        backgroundColor: theme.colors.primary,
                        borderRadius: theme.borderRadius.xl,
                        paddingVertical: theme.spacing.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...theme.shadows.md,
                        opacity: loading ? 0.5 : 1,
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={{ ...theme.typography.bodyBold, color: theme.colors.white }}>
                        {loading ? 'Saving...' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <>
                <InfoRow icon="person-outline" label="Name" value={user?.name || ''} />
                <InfoRow icon="mail-outline" label="Email" value={user?.email || ''} />
                <InfoRow icon="call-outline" label="Phone" value={user?.phone || ''} showBorder={false} />
              </>
            )}
          </View>

          {/* Account Statistics */}
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
              Account Statistics
            </Text>
            <StatRow label="Gold Balance" value={`${user?.goldBalance.toFixed(4)}g`} icon="diamond" />
            <StatRow label="Cash Balance" value={`₹${user?.walletBalance.toFixed(2)}`} icon="wallet" />
            <StatRow label="Account Type" value={user?.role === 'admin' ? 'Admin' : 'User'} icon="shield" showBorder={false} />
          </View>

          {/* Settings */}
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
              Settings
            </Text>
            <SettingRow
              icon="notifications-outline"
              label="Push Notifications"
              value={true}
              onValueChange={() => {}}
            />
            <SettingRow
              icon="moon-outline"
              label="Dark Mode"
              value={false}
              onValueChange={() => {}}
              showBorder={false}
            />
          </View>

          {/* Actions */}
          <View style={{
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            ...theme.shadows.md,
          }}>
            <MenuItem
              icon="help-circle-outline"
              title="Help & Support"
              onPress={() => Alert.alert('Help', 'Contact support@goldvault.com')}
            />
            <MenuItem
              icon="document-text-outline"
              title="Terms & Conditions"
              onPress={() => Alert.alert('Terms', 'Terms & Conditions')}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              onPress={() => Alert.alert('Privacy', 'Privacy Policy')}
              showBorder={false}
            />
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: theme.colors.red,
              borderRadius: theme.borderRadius.xl,
              paddingVertical: theme.spacing.md,
              alignItems: 'center',
              marginBottom: theme.spacing.xl,
              ...theme.shadows.lg,
            }}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.white} />
              <Text style={{ 
                ...theme.typography.bodyBold,
                color: theme.colors.white,
                marginLeft: theme.spacing.sm
              }}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={{ 
            ...theme.typography.small,
            color: theme.colors.gray400,
            textAlign: 'center'
          }}>
            GoldVault v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  showBorder?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, showBorder = true }) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: showBorder ? 1 : 0,
    borderBottomColor: theme.colors.gray100,
  }}>
    <View style={{
      backgroundColor: theme.colors.gray100,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      marginRight: theme.spacing.md,
    }}>
      <Ionicons name={icon} size={20} color={theme.colors.gray500} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ ...theme.typography.small, color: theme.colors.gray500 }}>
        {label}
      </Text>
      <Text style={{ ...theme.typography.body, fontWeight: '600', color: theme.colors.black }}>
        {value}
      </Text>
    </View>
  </View>
);

interface StatRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  showBorder?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ icon, label, value, showBorder = true }) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: showBorder ? 1 : 0,
    borderBottomColor: theme.colors.gray100,
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        width: 40,
        height: 40,
        backgroundColor: theme.colors.primary + '20',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
      }}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <Text style={{ ...theme.typography.body, color: theme.colors.black }}>
        {label}
      </Text>
    </View>
    <Text style={{ ...theme.typography.bodyBold, color: theme.colors.black }}>
      {value}
    </Text>
  </View>
);

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  showBorder?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, label, value, onValueChange, showBorder = true }) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: showBorder ? 1 : 0,
    borderBottomColor: theme.colors.gray100,
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        backgroundColor: theme.colors.gray100,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        marginRight: theme.spacing.md,
      }}>
        <Ionicons name={icon} size={20} color={theme.colors.gray500} />
      </View>
      <Text style={{ ...theme.typography.body, color: theme.colors.black }}>
        {label}
      </Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: theme.colors.gray300, true: theme.colors.primary + '80' }}
      thumbColor={value ? theme.colors.primary : theme.colors.white}
      ios_backgroundColor={theme.colors.gray300}
    />
  </View>
);

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  showBorder?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress, showBorder = true }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: showBorder ? 1 : 0,
      borderBottomColor: theme.colors.gray100,
    }}
    activeOpacity={0.7}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        backgroundColor: theme.colors.gray100,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        marginRight: theme.spacing.md,
      }}>
        <Ionicons name={icon} size={20} color={theme.colors.gray500} />
      </View>
      <Text style={{ ...theme.typography.body, color: theme.colors.black }}>
        {title}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
  </TouchableOpacity>
);