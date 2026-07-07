import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { useTheme } from "../../context/ThemeContext";
import { shadow } from "../../theme/theme";
import mockApi from "../../store/api";

const REWARD_ICON = {
  "Referral Bonus": "people",
  "Trading Reward": "trending-up",
  "Loyalty Reward": "ribbon",
  "Milestone Bonus": "trophy",
};

export default function RewardsScreen() {
  const { theme } = useTheme();
  const [rewards, setRewards] = useState([]);
  const [claiming, setClaiming] = useState(null);

  const load = useCallback(() => {
    mockApi.getRewards().then(setRewards);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const totalPending = rewards.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);

  const onClaim = async (reward) => {
    setClaiming(reward.id);
    try {
      await mockApi.claimReward(reward.id);
      Alert.alert("Reward claimed", `${reward.amount} ZOR has been added to your wallet.`);
      load();
    } finally {
      setClaiming(null);
    }
  };

  return (
    <ScreenContainer noPadding>
      <View style={{ paddingHorizontal: 20 }}>
        <Header title="Rewards" />
        <Card elevated style={{ marginBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: theme.muted, fontSize: 12 }}>Pending rewards</Text>
            <Text style={{ color: theme.gold, fontSize: 20, fontWeight: "800", marginTop: 4 }}>{totalPending} ZOR</Text>
          </View>
          <Ionicons name="gift" size={28} color={theme.gold} />
        </Card>
      </View>

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        data={rewards}
        keyExtractor={(r) => r.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<EmptyState icon="gift-outline" title="No rewards yet" subtitle="Refer friends and trade to start earning ZOR rewards." />}
        renderItem={({ item }) => (
          <Card elevated style={styles.row} noBorder>
            <View style={[styles.icon, { backgroundColor: `${theme.gold}1A` }]}>
              <Ionicons name={REWARD_ICON[item.type] || "gift-outline"} size={18} color={theme.gold} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: theme.foreground, fontWeight: "700", fontSize: 13 }}>{item.type}</Text>
              <Text style={{ color: theme.muted, fontSize: 11, marginTop: 2 }}>{item.date}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: theme.foreground, fontWeight: "800", fontSize: 13 }}>{item.amount} ZOR</Text>
              {item.status === "pending" ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onClaim(item)}
                  disabled={claiming === item.id}
                  style={[styles.claimBtn, { backgroundColor: theme.gold }, shadow(theme, "gold")]}
                >
                  <Text style={styles.claimText}>{claiming === item.id ? "Claiming…" : "Claim"}</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ marginTop: 6 }}>
                  <StatusBadge status={item.status} />
                </View>
              )}
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  claimBtn: { marginTop: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  claimText: { color: "#0A0A0A", fontWeight: "700", fontSize: 11 },
});
