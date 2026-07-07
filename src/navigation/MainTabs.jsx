import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../context/ThemeContext";
import { shadow } from "../theme/theme";

import HomeScreen from "../screens/Home/HomeScreen";
import WalletScreen from "../screens/Wallet/WalletScreen";
import MarketScreen from "../screens/Market/MarketScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: "home",
  Wallet: "wallet",
  Market: "trending-up",
  Profile: "person",
};

export default function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.gold,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.cardElevated,
          borderTopWidth: 0,
          height: 68,
          paddingBottom: 12,
          paddingTop: 10,
          ...shadow(theme, "lg"),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginTop: 2 },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`}
            size={size ? size - 1 : 21}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Market" component={MarketScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
