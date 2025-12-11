import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ImageBackground,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../store/hooks';
import { register } from '../store/authSlice';
import { useAlert } from '../contexts/AlertContext';

const { height } = Dimensions.get('window');

interface SignUpScreenProps {
  navigation: any;
}

type TabType = 'Quick Buy' | 'Track Gold' | 'Build Wealth';

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<TabType>('Track Gold');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useAlert();

  // Animation values
  const earnOpacity = useRef(new Animated.Value(0.25)).current;
  const spendOpacity = useRef(new Animated.Value(1)).current;
  const investOpacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    animateTab(selectedTab);
  }, [selectedTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedTab((prev) => {
        if (prev === 'Quick Buy') return 'Track Gold';
        if (prev === 'Track Gold') return 'Build Wealth';
        return 'Quick Buy';
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const animateTab = (tab: TabType) => {
    Animated.parallel([
      Animated.timing(earnOpacity, {
        toValue: tab === 'Quick Buy' ? 1 : 0.25,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(spendOpacity, {
        toValue: tab === 'Track Gold' ? 1 : 0.25,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(investOpacity, {
        toValue: tab === 'Build Wealth' ? 1 : 0.25,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);

    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  const validateInputs = () => {
    if (!name.trim()) {
      showError('Please enter your name');
      return false;
    }
    if (!email.trim()) {
      showError('Please enter your email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showError('Please enter a valid email');
      return false;
    }
    if (!phone.trim()) {
      showError('Please enter your phone number');
      return false;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      showError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      const phoneDigits = phone.replace(/\D/g, '');

      const actionResult = await dispatch(
        register({ name, email, phone: phoneDigits, password })
      ).unwrap();

      showSuccess(`Welcome ${actionResult.user.name}!`);
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Sign up error:', error);
      showError(
        error instanceof Error ? error.message : 'Could not create account'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('EmailLogin');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require('../assets/Auth3.png')}
          resizeMode="cover"
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Top Section - Animated Tabs */}
            <View style={{ minHeight: height * 0.17, justifyContent: 'center', paddingHorizontal: 24 }}>
              {/* You can uncomment these if you want the animated text back */}
              {/* <Animated.View
                className="flex-row items-center mb-6"
                style={{ opacity: earnOpacity }}
              >
                <Text
                  className="font-bold text-white"
                  style={{
                    fontSize: 40,
                    letterSpacing: -2,
                  }}
                >
                  Vault
                </Text>
              </Animated.View>

              <Animated.View
                className="flex-row items-center mb-6"
                style={{ opacity: spendOpacity }}
              >
                <Text
                  className="font-bold text-white"
                  style={{
                    fontSize: 52,
                    letterSpacing: -2,
                  }}
                >
                  Track
                </Text>
              </Animated.View>

              <Animated.View
                className="flex-row items-center"
                style={{ opacity: investOpacity }}
              >
                <Text
                  className="font-bold text-white"
                  style={{
                    fontSize: 40,
                    letterSpacing: -2,
                  }}
                >
                  Worth
                </Text>
              </Animated.View> */}
            </View>

            {/* Bottom Section - Card */}
            <View className="rounded-t-[32px] px-6 pt-10 pb-6">
              {/* Heading */}
              <View className="mb-8">
                <Text
                  className="text-black mb-2"
                  style={{
                    fontSize: 38,
                    letterSpacing: 0.5,
                    lineHeight: 42,
                    fontWeight: 'bold',
                  }}
                >
                  Create Account
                </Text>
                <Text
                  className="text-black"
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    opacity: 0.8,
                  }}
                >
                  Start your journey to financial freedom
                </Text>
              </View>

              {/* Name Input */}
              <View className="mb-4">
                <Text
                  className="text-black mb-2 ml-1"
                  style={{ fontSize: 14, opacity: 0.8, fontWeight: '500' }}
                >
                  Full Name
                </Text>
                <View
                  className="rounded-[16px] h-14 flex-row items-center px-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Ionicons name="person-outline" size={20} color="#000" style={{ opacity: 0.6 }} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    autoCapitalize="words"
                    autoComplete="name"
                    className="flex-1 text-black ml-3"
                    style={{ fontSize: 16 }}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Text
                  className="text-black mb-2 ml-1"
                  style={{ fontSize: 14, opacity: 0.8, fontWeight: '500' }}
                >
                  Email
                </Text>
                <View
                  className="rounded-[16px] h-14 flex-row items-center px-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Ionicons name="mail-outline" size={20} color="#000" style={{ opacity: 0.6 }} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className="flex-1 text-black ml-3"
                    style={{ fontSize: 16 }}
                  />
                </View>
              </View>

              {/* Phone Number Input */}
              <View className="mb-4">
                <Text
                  className="text-black mb-2 ml-1"
                  style={{ fontSize: 14, opacity: 0.8, fontWeight: '500' }}
                >
                  Phone Number
                </Text>
                <View
                  className="rounded-[16px] h-14 flex-row items-center px-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Ionicons name="call-outline" size={20} color="#000" style={{ opacity: 0.6 }} />
                  <TextInput
                    value={phone}
                    onChangeText={handlePhoneChange}
                    placeholder="(123) 456-7890"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    maxLength={14}
                    className="flex-1 text-black ml-3"
                    style={{ fontSize: 16 }}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text
                  className="text-black mb-2 ml-1"
                  style={{ fontSize: 14, opacity: 0.8, fontWeight: '500' }}
                >
                  Password
                </Text>
                <View
                  className="rounded-[16px] h-14 flex-row items-center px-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Ionicons name="lock-closed-outline" size={20} color="#000" style={{ opacity: 0.6 }} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    className="flex-1 text-black ml-3"
                    style={{ fontSize: 16 }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#000"
                      style={{ opacity: 0.6 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View className="mb-6">
                <Text
                  className="text-black mb-2 ml-1"
                  style={{ fontSize: 14, opacity: 0.8, fontWeight: '500' }}
                >
                  Confirm Password
                </Text>
                <View
                  className="rounded-[16px] h-14 flex-row items-center px-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Ionicons name="lock-closed-outline" size={20} color="#000" style={{ opacity: 0.6 }} />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    className="flex-1 text-black ml-3"
                    style={{ fontSize: 16 }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#000"
                      style={{ opacity: 0.6 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSignUp}
                disabled={isLoading}
                className="bg-black rounded-[28px] h-14 flex-row items-center justify-center shadow-lg mb-4"
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-[17px]">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View className="flex-row items-center justify-center mb-4">
                <Text
                  className="text-black"
                  style={{ fontSize: 14, opacity: 0.7 }}
                >
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
                  <Text
                    className="text-black font-semibold"
                    style={{ fontSize: 14 }}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Terms */}
              <Text
                className="text-black text-center"
                style={{
                  fontSize: 12,
                  opacity: 0.5,
                }}
              >
                By continuing, you agree to our Terms & Privacy Policy
              </Text>
            </View>
          </ScrollView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;