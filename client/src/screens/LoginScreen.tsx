import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../store/hooks';
import { googleLogin } from '../store/authSlice';
import { useAlert } from '../contexts/AlertContext';
import { useGoogleAuth } from '../services/expoGoogleAuth';

const { height } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
}

type TabType = 'Quick Buy' | 'Track Gold' | 'Build Wealth';

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { signInWithGoogle } = useGoogleAuth();
  const [selectedTab, setSelectedTab] = useState<TabType>('Track Gold');
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
    // Auto-rotate tabs every 1.5 seconds
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (result && result.idToken) {
        console.log('Google User Info:', result.user);
        
        // Dispatch the login action with the ID token
        const actionResult = await dispatch(googleLogin(result.idToken)).unwrap();
        showSuccess('Login Success', `Welcome ${actionResult.user.name}!`);
        
        // Navigate to Home screen
        navigation.replace('MainTabs');
      } else if (result === null) {
        // User cancelled the sign-in
        console.log('User cancelled Google Sign In');
      } else {
        showError('Error', 'Could not get ID Token from Google');
      }
    } catch (error) {
      console.error('Google login error:', error);
      showError('Login Failed', error instanceof Error ? error.message : 'Could not sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = () => {
    navigation.navigate('EmailLogin');
  };

  return (
    <ImageBackground
      source={require('../assets/Auth.png')}
      resizeMode="cover"
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
        <View className="flex-1 rounded-t-[32px] px-6 pt-10 pb-6">
          {/* Logo */}
          <View className="w-16 h-16 bg-white rounded-[18px] items-center justify-center mb-6 shadow-lg">
            <Ionicons name="diamond" size={34} color="#FFD700" />
          </View>

          {/* Heading */}
          <View className="mb-10">
            <Text
              className="text-white mb-6"
              style={{
                fontSize: 48,
                letterSpacing: 0.5,
                lineHeight: 50,
              }}
            >
              Gold for the,{'\n'}Digital age.
            </Text>
            <Text
              className="text-white"
              style={{
                fontSize: 14,
                lineHeight: 20,
                opacity: 0.9,
              }}
            >
              Build your future,{'\n'}one gram at a time.
            </Text>
          </View>

          {/* Buttons */}
          <View className="gap-4 mb-6">
            {/* Google Sign In Button */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={isLoading}
              className="bg-white rounded-[28px] h-14 flex-row items-center justify-center shadow-lg"
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={22} color="#000" />
                  <Text className="text-black font-semibold text-[17px] ml-2">
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Email Button */}
            <TouchableOpacity
              onPress={handleEmailLogin}
              disabled={isLoading}
              className="rounded-[28px] h-14 flex-row items-center justify-center border-[1.5px]"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="mail" size={22} color="#fff" />
              <Text className="text-white font-semibold text-[17px] ml-2">
                Continue with Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text
            className="text-white text-center"
            style={{
              fontSize: 12,
              opacity: 0.6,
            }}
          >
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;
