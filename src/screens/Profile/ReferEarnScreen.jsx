import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Clipboard from "@react-native-clipboard/clipboard";
import LinearGradient from "react-native-linear-gradient";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import { useTheme } from "../../context/ThemeContext";
import mockApi from "../../store/api";
import { gradients, shadow } from "../../theme/theme";

export default function ReferEarnScreen() {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    mockApi.getReferralData().then(setData);
  }, []);

  const onCopy = async () => {
    if (!data) return;
    Clipboard.setString(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onShare = () =>
    data && Share.share({ message: `Join ZORO and get rewarded — use my code ${data.referralCode} when you sign up!` });

  return (
    <ScreenContainer noPadding>
      <View style={{ paddingHorizontal: 20 }}>
        <Header title="Refer & earn" />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
        <LinearGradient colors={gradients.heroGoldDeep} style={[styles.card, shadow(theme, "gold")]}>
          <Text style={styles.cardLabel}>Your referral code</Text>
          <Text style={styles.code}>{data?.referralCode || "—"}</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={onCopy} style={styles.miniBtn}>
              <Ionicons name={copied ? "checkmark" : "copy-outline"} size={16} color="#0A0A0A" />
              <Text style={styles.miniBtnText}>{copied ? "Copied" : "Copy"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onShare} style={styles.miniBtn}>
              <Ionicons name="share-social-outline" size={16} color="#0A0A0A" />
              <Text style={styles.miniBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <Card elevated style={[styles.stat, { marginRight: 10 }]}>
            <Text style={[styles.statValue, { color: theme.foreground }]}>{data?.totalUsers ?? 0}</Text>
            <Text style={{ color: theme.muted, fontSize: 11 }}>Total invited</Text>
          </Card>
          <Card elevated style={[styles.stat, { marginRight: 10 }]}>
            <Text style={[styles.statValue, { color: theme.foreground }]}>{data?.successfulReferrals ?? 0}</Text>
            <Text style={{ color: theme.muted, fontSize: 11 }}>Joined</Text>
          </Card>
          <Card elevated style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.gold }]}>{data?.totalRewards ?? 0}</Text>
            <Text style={{ color: theme.muted, fontSize: 11 }}>ZOR earned</Text>
          </Card>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Referred users</Text>
        {(data?.referredUsers || []).map((u) => (
          <Card key={u.name} elevated style={styles.userRow} noBorder>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.foreground, fontWeight: "700", fontSize: 13 }}>{u.name}</Text>
              <Text style={{ color: theme.muted, fontSize: 11, marginTop: 2 }}>Joined {u.joinedAt}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <StatusBadge status={u.status} />
              <Text style={{ color: theme.gold, fontWeight: "700", fontSize: 12, marginTop: 6 }}>+{u.reward} ZOR</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, padding: 20, marginBottom: 20 },
  cardLabel: { color: "#3a3202", fontWeight: "600", fontSize: 12 },
  code: { color: "#0A0A0A", fontSize: 24, fontWeight: "800", marginVertical: 10, letterSpacing: 1 },
  actionsRow: { flexDirection: "row", marginTop: 10 },
  miniBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(10,10,10,0.1)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginRight: 10 },
  miniBtnText: { color: "#0A0A0A", fontWeight: "700", fontSize: 12, marginLeft: 6 },
  statsRow: { flexDirection: "row", marginBottom: 20 },
  stat: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statValue: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 12 },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
});
