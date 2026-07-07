import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../../components/ScreenContainer";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import MarketTicker from "../../components/MarketTicker";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import mockApi from "../../store/api";
import { gradients, shadow } from "../../theme/theme";

const QUICK_ACTIONS = [
  { key: "SendAddress", label: "Send", icon: "arrow-up-circle" },
  { key: "Receive", label: "Receive", icon: "arrow-down-circle" },
  { key: "ScanQr", label: "Scan", icon: "qr-code" },
  { key: "BankAccounts", label: "Bank", icon: "business" },
];

// A handful of fixed accent colors (independent of theme mode) used to give
// each counterparty a stable, distinct avatar color — purely decorative.
const AVATAR_PALETTE = ["#FBD12D", "#16C784", "#6366F1", "#F97316", "#EC4899", "#22D3EE"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good night,";
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  if (h < 21) return "Good evening,";
  return "Good night,";
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
}

function getAvatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [kyc, setKyc] = useState(null);
  const [coins, setCoins] = useState([]);
  const [hideBalance, setHideBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [w, tx, k, m] = await Promise.all([
      mockApi.getWalletDashboard(),
      mockApi.getTransactionList(),
      mockApi.getKycStatus(),
      mockApi.getMarketOverview(),
    ]);
    setWallet(w);
    setTransactions(tx.transactions.slice(0, 4));
    setKyc(k);
    setCoins((m.data || []).slice(0, 6));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScreenContainer noPadding>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.gold} />}
      >
        <View style={styles.topRow}>
          <View style={styles.identityRow}>
            <View style={[styles.avatar, { backgroundColor: theme.gold }, shadow(theme, "gold")]}>
              <Text style={styles.avatarText}>{getInitials(user?.name || "Zoro")}</Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.greeting, { color: theme.muted }]}>{getGreeting()}</Text>
              <Text style={[styles.name, { color: theme.foreground }]}>{user?.name || "there"}</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate("Notifications")}
            style={[styles.bellBtn, { backgroundColor: theme.card, borderColor: theme.borderSoft }, shadow(theme, "sm")]}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.foreground} />
          </TouchableOpacity>
        </View>

        <MarketTicker coins={coins} />

        <LinearGradient
          colors={gradients.heroGoldDeep}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.balanceCard, shadow(theme, "gold")]}
        >
          <View style={styles.balanceTopRow}>
            <Text style={styles.balanceLabel}>Total balance</Text>
            <TouchableOpacity
              onPress={() => setHideBalance((s) => !s)}
              style={styles.eyeBtn}
            >
              <Ionicons name={hideBalance ? "eye-off-outline" : "eye-outline"} size={18} color="#0A0A0A" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceValue}>
            {hideBalance ? "•••••••" : `${wallet ? wallet.balance.toLocaleString() : "0.00"} ZOR`}
          </Text>
          <View style={styles.walletIdRow}>
            <View style={styles.walletIdChip}>
              <Ionicons name="wallet-outline" size={13} color="#0A0A0A" />
              <Text style={styles.walletId}> {wallet?.id || "—"}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.actionsRow}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.key}
              activeOpacity={0.75}
              style={styles.actionItem}
              onPress={() => navigation.navigate(a.key)}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.cardElevated, borderColor: theme.borderSoft }, shadow(theme, "sm")]}>
                <Ionicons name={a.icon} size={22} color={theme.gold} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.foreground }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {kyc && kyc.status !== "approved" && (
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate("KycIntro")}>
            <Card elevated style={[styles.kycBanner, { borderColor: `${theme.gold}55` }]}>
              <View style={[styles.kycIconWrap, { backgroundColor: `${theme.gold}1F` }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={theme.gold} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.kycTitle, { color: theme.foreground }]}>Complete your KYC</Text>
                <Text style={[styles.kycSub, { color: theme.muted }]}>Unlock higher limits & rewards</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.muted} />
            </Card>
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Recent activity</Text>
          <Text onPress={() => navigation.navigate("TransactionHistory")} style={{ color: theme.gold, fontWeight: "700", fontSize: 13 }}>
            See all
          </Text>
        </View>

        <Card elevated noBorder style={styles.txCard}>
          {transactions.map((tx, idx) => {
            const avatarColor = getAvatarColor(tx.counterparty || "?");
            return (
              <TouchableOpacity
                key={tx.id}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("TransactionDetail", { id: tx.id })}
                style={[styles.txRow, idx < transactions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.borderSoft }]}
              >
                <View style={styles.txAvatarWrap}>
                  <View style={[styles.txAvatar, { backgroundColor: `${avatarColor}22`, borderColor: `${avatarColor}44` }]}>
                    <Text style={{ color: avatarColor, fontWeight: "800", fontSize: 13 }}>{getInitials(tx.counterparty || "?")}</Text>
                  </View>
                  <View style={[styles.txBadge, { backgroundColor: theme.cardElevated, borderColor: theme.borderSoft }]}>
                    <Ionicons
                      name={tx.type === "received" ? "arrow-down" : "arrow-up"}
                      size={9}
                      color={tx.type === "received" ? theme.success : theme.gold}
                    />
                  </View>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.txName, { color: theme.foreground }]}>{tx.counterparty}</Text>
                  <Text style={{ color: theme.muted, fontSize: 12 }}>{new Date(tx.createdAt).toLocaleString()}</Text>
                </View>
                <Text style={{ color: tx.type === "received" ? theme.success : theme.foreground, fontWeight: "700" }}>
                  {tx.type === "received" ? "+" : "-"}
                  {tx.amount} ZOR
                </Text>
              </TouchableOpacity>
            );
          })}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 18 },
  identityRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#0A0A0A", fontWeight: "800", fontSize: 16 },
  greeting: { fontSize: 13 },
  name: { fontSize: 21, fontWeight: "800", marginTop: 2 },
  bellBtn: { width: 44, height: 44, borderRadius: 15, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  balanceCard: { borderRadius: 24, padding: 22, marginBottom: 24 },
  balanceTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  balanceLabel: { color: "#0A0A0A", fontWeight: "700", fontSize: 13, opacity: 0.7 },
  eyeBtn: { width: 30, height: 30, borderRadius: 10, backgroundColor: "rgba(10,10,10,0.08)", alignItems: "center", justifyContent: "center" },
  balanceValue: { color: "#0A0A0A", fontSize: 32, fontWeight: "800", marginTop: 10, letterSpacing: 0.2 },
  walletIdRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  walletIdChip: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(10,10,10,0.08)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  walletId: { color: "#0A0A0A", fontSize: 12, fontWeight: "700" },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  actionItem: { alignItems: "center", width: "22%" },
  actionIcon: { width: 56, height: 56, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 9 },
  actionLabel: { fontSize: 11, fontWeight: "700" },
  kycBanner: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, marginBottom: 24 },
  kycIconWrap: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  kycTitle: { fontSize: 13, fontWeight: "700" },
  kycSub: { fontSize: 11, marginTop: 2 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  txCard: { padding: 6, marginBottom: 10 },
  txRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, paddingHorizontal: 10 },
  txIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  txAvatarWrap: { width: 40, height: 40 },
  txAvatar: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  txBadge: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  txName: { fontSize: 13, fontWeight: "700" },
});
