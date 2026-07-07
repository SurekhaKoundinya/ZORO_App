import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import MainTabs from "./MainTabs";

// Auth
import SplashScreen from "../screens/Auth/SplashScreen";
import OnboardingScreen from "../screens/Auth/OnboardingScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import OtpVerificationScreen from "../screens/Auth/OtpVerificationScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/Auth/ResetPasswordScreen";
import ProfileSetupScreen from "../screens/Auth/ProfileSetupScreen";
import TransactionPinScreen from "../screens/Auth/TransactionPinScreen";

// KYC
import KycIntroScreen from "../screens/KYC/KycIntroScreen";
import KycUploadScreen from "../screens/KYC/KycUploadScreen";
import KycStatusScreen from "../screens/KYC/KycStatusScreen";

// Home / Wallet
import NotificationsScreen from "../screens/Home/NotificationsScreen";
import TransactionHistoryScreen from "../screens/Wallet/TransactionHistoryScreen";
import TransactionDetailScreen from "../screens/Wallet/TransactionDetailScreen";

// Send / Receive
import SendAddressScreen from "../screens/Send/SendAddressScreen";
import ScanQrScreen from "../screens/Send/ScanQrScreen";
import SendAmountScreen from "../screens/Send/SendAmountScreen";
import SendPinScreen from "../screens/Send/SendPinScreen";
import SendSuccessScreen from "../screens/Send/SendSuccessScreen";
import ReceiveScreen from "../screens/Send/ReceiveScreen";

// Bank
import BankAccountsScreen from "../screens/Bank/BankAccountsScreen";
import AddBankAccountScreen from "../screens/Bank/AddBankAccountScreen";

// Market
import CoinDetailScreen from "../screens/Market/CoinDetailScreen";

// Profile
import EditProfileScreen from "../screens/Profile/EditProfileScreen";
import SettingsScreen from "../screens/Profile/SettingsScreen";
import ReferEarnScreen from "../screens/Profile/ReferEarnScreen";
import RewardsScreen from "../screens/Profile/RewardsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoading, isAuthenticated, hasSeenOnboarding } = useAuth();
  const { theme, mode } = useTheme();

  const navTheme = {
    ...(mode === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.card,
      text: theme.foreground,
      border: theme.border,
      primary: theme.gold,
    },
  };

  // Conditionally registering a different screen group per auth state (rather
  // than relying on initialRouteName, which only applies on first mount) is
  // the pattern React Navigation recommends for auth flows — swapping the
  // group forces the navigator to reset cleanly when login/logout happens.
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        {isLoading ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : !hasSeenOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="TransactionPin" component={TransactionPinScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="TransactionPin" component={TransactionPinScreen} />

            <Stack.Screen name="KycIntro" component={KycIntroScreen} />
            <Stack.Screen name="KycUpload" component={KycUploadScreen} />
            <Stack.Screen name="KycStatus" component={KycStatusScreen} />

            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
            <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />

            <Stack.Screen name="SendAddress" component={SendAddressScreen} />
            <Stack.Screen name="ScanQr" component={ScanQrScreen} />
            <Stack.Screen name="SendAmount" component={SendAmountScreen} />
            <Stack.Screen name="SendPin" component={SendPinScreen} />
            <Stack.Screen name="SendSuccess" component={SendSuccessScreen} />
            <Stack.Screen name="Receive" component={ReceiveScreen} />

            <Stack.Screen name="BankAccounts" component={BankAccountsScreen} />
            <Stack.Screen name="AddBankAccount" component={AddBankAccountScreen} />

            <Stack.Screen name="CoinDetail" component={CoinDetailScreen} />

            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ReferEarn" component={ReferEarnScreen} />
            <Stack.Screen name="Rewards" component={RewardsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
