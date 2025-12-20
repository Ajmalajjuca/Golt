import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectMetalType } from '../store/priceSelectors';
import { loadUser } from '../store/authSlice';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { RegisterScreen } from '../screens/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { BuyGoldScreen } from '../screens/BuyGoldScreen';
import { SellGoldScreen } from '../screens/SellGoldScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { KYCScreen } from '../screens/KYCScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { OverlayActionMenu } from '../components/OverlayActionMenu';
import { CustomTabBar } from '../components/CustomTabBar';
import { theme } from '../theme';
import LoginScreen from '../screens/LoginScreen';
import EmailLoginScreen from '../screens/EmailLoginScreen';
import SignUpScreen from '../screens/SignUpScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
const MainTabs = ({ navigation: parentNavigation }: any) => {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const metalType = useAppSelector(selectMetalType);

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            onFABPress={() => setShowActionMenu(true)}
          />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={DashboardScreen} />
        <Tab.Screen name="Transactions" component={TransactionsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      <OverlayActionMenu
        visible={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        onBuyPress={() => {
          setShowActionMenu(false);
          // Small delay to allow menu close animation
          setTimeout(() => {
            parentNavigation.navigate('BuyGold', { metalType });
          }, 200);
        }}
        onSellPress={() => {
          setShowActionMenu(false);
          setTimeout(() => {
            parentNavigation.navigate('SellGold', { metalType });
          }, 200);
        }}
        metalType={metalType}
      />
    </>
  );
};

export const AppNavigator = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    dispatch(loadUser()).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.white }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.white }}>
        {!isAuthenticated ? (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            {/* <Stack.Screen name="Register" component={RegisterScreen} />r */}
          </Stack.Navigator>
        ) : (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="BuyGold" component={BuyGoldScreen} />
            <Stack.Screen name="SellGold" component={SellGoldScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="KYC" component={KYCScreen} />
          </Stack.Navigator>
        )}
      </SafeAreaView>
    </NavigationContainer>
  );
};
