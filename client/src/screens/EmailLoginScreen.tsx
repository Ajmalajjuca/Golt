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
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../store/hooks';
import { login, register } from '../store/authSlice';

const { height } = Dimensions.get('window');

interface EmailLoginScreenProps {
  navigation: any;
}

type TabType = 'Quick Buy' | 'Track Gold' | 'Build Wealth';

const EmailLoginScreen: React.FC<EmailLoginScreenProps> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<TabType>('Track Gold');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

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

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const actionResult = await dispatch(
        login({ email, password })
      ).unwrap();
      
      Alert.alert('Success', `Welcome back ${actionResult.user.name}!`);
      navigation.replace('Home');
    } catch (error) {
      console.error('Email login error:', error);
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'Invalid email or password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <ImageBackground
      source={require('../assets/Auth2.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Top Section - Animated Tabs */}
        <View className="flex-1 px-6 justify-center">
          <Animated.View
            className="flex-row items-center mb-6"
            style={{ opacity: earnOpacity }}
          >
            <Text
              className="font-bold text-black"
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
              className="font-bold text-black"
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
              className="font-bold text-black"
              style={{
                fontSize: 40,
                letterSpacing: -2,
              }}
            >
              Worth
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Section - Card */}
        <View className="overflow-hidden" style={{ height: height * 0.58 }}>
          <ScrollView
            className="flex-1 rounded-t-[32px] px-6 pt-10 pb-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* Heading */}
            <View className="mb-8">
              <Text
                className="text-black mb-2"
                style={{
                  fontSize: 38,
                  letterSpacing: 0.5,
                  lineHeight: 42,
                }}
              >
                Welcome back
              </Text>
              <Text
                className="text-black"
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  opacity: 0.9,
                }}
              >
                Sign in to continue building your future
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text
                className="text-black mb-2 ml-1"
                style={{ fontSize: 14, opacity: 0.9 }}
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
                <Ionicons name="mail-outline" size={20} color="#000" style={{ opacity: 0.7 }} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  className="flex-1 text-black ml-3"
                  style={{ fontSize: 16 }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text
                className="text-black mb-2 ml-1"
                style={{ fontSize: 14, opacity: 0.9 }}
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
                <Ionicons name="lock-closed-outline" size={20} color="#000" style={{ opacity: 0.7 }} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
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
                    style={{ opacity: 0.7 }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              className="self-end mb-6"
              activeOpacity={0.7}
            >
              <Text
                className="text-black"
                style={{ fontSize: 14, opacity: 0.9 }}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleEmailLogin}
              disabled={isLoading}
              className="bg-black rounded-[28px] h-14 flex-row items-center justify-center shadow-lg mb-4"
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-[17px]">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row items-center justify-center mb-4">
              <Text
                className="text-black"
                style={{ fontSize: 14, opacity: 0.7 }}
              >
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
                <Text
                  className="text-black font-semibold"
                  style={{ fontSize: 14 }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text
              className="text-black text-center"
              style={{
                fontSize: 12,
                opacity: 0.6,
              }}
            >
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default EmailLoginScreen;