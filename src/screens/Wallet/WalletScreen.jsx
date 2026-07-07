import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import Clipboard from "@react-native-clipboard/clipboard";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../../components/ScreenContainer";
import Card from "../../components/Card";
import { useTheme } from "../../context/ThemeContext";
import mockApi from "../../store/api";
import { gradients, shadow } from "../../theme/theme";

export default function WalletScreen({ navigation }) {
  const { theme } = useTheme();
  const [wallet, setWallet] = useState(null);
  const [incomeOutcome, setIncomeOutcome] = useState(null);
  const [address, setAddress] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const [w, io, addr] = await Promise.all([
      mockApi.getWalletDashboard(),
      mockApi.getIncomeOutcome(),
      mockApi.generateAddress(),
    ]);
    setWallet(w);
    setIncomeOutcome(io);
    setAddress(addr.address);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onCopy = async () => {
    if (!address) return;
    Clipboard.setString(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const dailyPct = wallet ? Math.min(100, Math.round((wallet.dailyUsed / wallet.dailyLimit) * 100)) : 0;

  return (
    <ScreenContainer noPadding>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
        <Text style={[styles.header, { color: theme.foreground }]}>Wallet</Text>

        <LinearGradient colors={gradients.heroBlack} style={[styles.card, shadow(theme, "lg"), { borderWidth: 1, borderColor: theme.borderSoft }]}>
          <Text style={styles.label}>Wallet address</Text>
          <TouchableOpacity onPress={onCopy} style={styles.addressRow}>
            <Text style={styles.address} numberOfLines={1}>
              {address || "—"}
            </Text>
            <Ionicons name={copied ? "checkmark" : "copy-outline"} size={18} color="#FBD12D" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <Text style={styles.label}>Balance</Text>
          <Text style={styles.balance}>{wallet ? wallet.balance.toLocaleString() : "0.00"} ZOR</Text>
        </LinearGradient>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { marginRight: 10 }]}>
            <Ionicons name="arrow-down-circle-outline" size={20} color={theme.success} />
            <Text style={{ color: theme.muted, fontSize: 12, marginTop: 8 }}>Income</Text>
            <Text style={[styles.statValue, { color: theme.foreground }]}>{incomeOutcome?.income ?? 0}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="arrow-up-circle-outline" size={20} color={theme.gold} />
            <Text style={{ color: theme.muted, fontSize: 12, marginTop: 8 }}>Outcome</Text>
            <Text style={[styles.statValue, { color: theme.foreground }]}>{incomeOutcome?.outcome ?? 0}</Text>
          </Card>
        </View>

        <Card style={{ marginTop: 4, marginBottom: 20 }}>
          <View style={styles.rowBetween}>
            <Text style={{ color: theme.foreground, fontWeight: "700", fontSize: 13 }}>Daily limit</Text>
            <Text style={{ color: theme.muted, fontSize: 12 }}>
              {wallet?.dailyUsed ?? 0} / {wallet?.dailyLimit ?? 0} ZOR
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { width: `${dailyPct}%`, backgroundColor: theme.gold }]} />
          </View>
        </Card>

        <Card style={{ marginBottom: 20 }}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={{ color: theme.foreground, fontWeight: "700", fontSize: 13 }}>Referral rewards</Text>
              <Text style={{ color: theme.muted, fontSize: 12, marginTop: 3 }}>{wallet?.referralStatus}</Text>
            </View>
            <Text style={{ color: theme.gold, fontWeight: "800", fontSize: 16 }}>{wallet?.referralRewards ?? 0} ZOR</Text>
          </View>
        </Card>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.pillBtn, { backgroundColor: theme.gold }, shadow(theme, "gold")]}
            onPress={() => navigation.navigate("SendAddress")}
          >
            <Text style={styles.pillBtnText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.pillBtn, { backgroundColor: "transparent", borderWidth: 1.5, borderColor: theme.gold }]}
            onPress={() => navigation.navigate("Receive")}
          >
            <Text style={[styles.pillBtnText, { color: theme.gold }]}>Receive</Text>
          </TouchableOpacity>
        </View>

        <Text onPress={() => navigation.navigate("TransactionHistory")} style={[styles.linkRow, { color: theme.gold }]}>
          View full transaction history →
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: "800", marginTop: 8, marginBottom: 18 },
  card: { borderRadius: 22, padding: 20, marginBottom: 18 },
  label: { color: "#8A857C", fontSize: 12, fontWeight: "600" },
  addressRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  address: { color: "#FAFAFA", fontSize: 14, fontWeight: "600", flex: 1, marginRight: 10 },
  divider: { height: 1, backgroundColor: "#1F1F1F", marginVertical: 16 },
  balance: { color: "#FBD12D", fontSize: 26, fontWeight: "800", marginTop: 6 },
  statsRow: { flexDirection: "row", marginBottom: 18 },
  statCard: { flex: 1 },
  statValue: { fontSize: 16, fontWeight: "800", marginTop: 4 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTrack: { height: 8, borderRadius: 4, marginTop: 12, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  actionsRow: { flexDirection: "row", marginBottom: 20 },
  pillBtn: { flex: 1, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 10 },
  pillBtnText: { color: "#0A0A0A", fontWeight: "700" },
  linkRow: { textAlign: "center", fontWeight: "600", fontSize: 13, marginBottom: 10 },
});
