import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../../components/ScreenContainer";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { shadow } from "../../theme/theme";
import mockApi from "../../store/api";

const MENU = [
  { key: "EditProfile", label: "Edit profile", icon: "person-outline" },
  { key: "KycIntro", label: "Identity verification", icon: "shield-checkmark-outline" },
  { key: "ReferEarn", label: "Refer & earn", icon: "people-outline" },
  { key: "Rewards", label: "Rewards", icon: "gift-outline" },
  { key: "BankAccounts", label: "Linked bank accounts", icon: "business-outline" },
  { key: "TransactionPin", label: "Change transaction PIN", icon: "keypad-outline" },
  { key: "Settings", label: "Settings", icon: "settings-outline" },
];

export default function ProfileScreen({ navigation }) {
  const { theme, mode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [kyc, setKyc] = useState(null);

  useFocusEffect(
    useCallback(() => {
      mockApi.getKycStatus().then(setKyc);
    }, [])
  );

  const onLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScreenContainer noPadding>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.header, { color: theme.foreground }]}>Profile</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={toggleTheme}
            style={[styles.themeBtn, { backgroundColor: theme.card, borderColor: theme.borderSoft }, shadow(theme, "sm")]}
          >
            <Ionicons name={mode === "dark" ? "sunny-outline" : "moon-outline"} size={18} color={theme.gold} />
          </TouchableOpacity>
        </View>

        <Card elevated style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: theme.gold }, shadow(theme, "gold")]}>
            <Text style={styles.avatarText}>{user?.avatar || "?"}</Text>
          </View>
          <Text style={[styles.name, { color: theme.foreground }]}>{user?.name}</Text>
          <Text style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>{user?.email}</Text>
          <View style={{ marginTop: 10 }}>{kyc ? <StatusBadge status={kyc.status} label={`KYC: ${kyc.status}`} /> : null}</View>
        </Card>

        <Card elevated style={{ paddingVertical: 4, marginTop: 20 }}>
          {MENU.map((m, i) => (
            <TouchableOpacity
              key={m.key}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(m.key)}
              style={[styles.menuRow, i !== MENU.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.borderSoft }]}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: `${theme.gold}14` }]}>
                <Ionicons name={m.icon} size={17} color={theme.gold} />
              </View>
              <Text style={{ color: theme.foreground, fontSize: 13, fontWeight: "600", flex: 1 }}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={17} color={theme.muted} />
            </TouchableOpacity>
          ))}
        </Card>

        <TouchableOpacity activeOpacity={0.8} onPress={onLogout} style={[styles.logoutBtn, { borderColor: theme.danger }]}>
          <Ionicons name="log-out-outline" size={18} color={theme.danger} />
          <Text style={{ color: theme.danger, fontWeight: "700", marginLeft: 8 }}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 20 },
  header: { fontSize: 22, fontWeight: "800" },
  themeBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  profileCard: { alignItems: "center", paddingVertical: 24 },
  avatar: { width: 68, height: 68, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "#0A0A0A", fontWeight: "800", fontSize: 22 },
  name: { fontSize: 17, fontWeight: "800" },
  menuRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, paddingHorizontal: 6 },
  menuIconWrap: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", marginRight: 12 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, borderRadius: 14, borderWidth: 1.5, marginTop: 24 },
});
