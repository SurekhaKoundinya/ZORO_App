import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import PrimaryButton from "../../components/PrimaryButton";
import StatusBadge from "../../components/StatusBadge";
import { useTheme } from "../../context/ThemeContext";
import { shadow } from "../../theme/theme";
import mockApi from "../../store/api";

const PERKS = [
  { icon: "trending-up", text: "Higher daily transfer limits" },
  { icon: "shield-checkmark-outline", text: "Full account protection & recovery" },
  { icon: "gift-outline", text: "Eligibility for milestone rewards" },
];

export default function KycIntroScreen({ navigation }) {
  const { theme } = useTheme();
  const [status, setStatus] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      mockApi.getKycStatus().then((s) => mounted && setStatus(s));
      return () => (mounted = false);
    }, [])
  );

  const isVerified = status?.status === "approved";
  const isPending = status?.status === "pending";

  return (
    <ScreenContainer>
      <Header title="Identity verification" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card elevated style={{ alignItems: "center", paddingVertical: 28, marginBottom: 20 }}>
          <View style={[styles.iconWrap, { backgroundColor: `${theme.gold}14`, borderColor: `${theme.gold}33` }, shadow(theme, "sm")]}>
            <Ionicons name="shield-checkmark" size={36} color={theme.gold} />
          </View>
          <Text style={[styles.title, { color: theme.foreground }]}>{status?.level || "Level 1"} KYC</Text>
          {status ? <StatusBadge status={status.status} /> : null}
        </Card>

        {!isVerified && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Why verify?</Text>
            {PERKS.map((p) => (
              <View key={p.text} style={styles.perkRow}>
                <Ionicons name={p.icon} size={20} color={theme.gold} style={{ marginRight: 12 }} />
                <Text style={[styles.perkText, { color: theme.muted }]}>{p.text}</Text>
              </View>
            ))}
          </>
        )}

        {isVerified ? (
          <Text style={[styles.sub, { color: theme.muted, marginTop: 20 }]}>
            You're fully verified. Your account has the highest transfer limits and reward eligibility.
          </Text>
        ) : isPending ? (
          <PrimaryButton
            title="Check status"
            variant="outline"
            onPress={() => navigation.navigate("KycStatus")}
            style={{ marginTop: 30 }}
          />
        ) : (
          <PrimaryButton
            title="Start verification"
            onPress={() => navigation.navigate("KycUpload")}
            style={{ marginTop: 30 }}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
  perkRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  perkText: { fontSize: 13, flex: 1 },
  sub: { fontSize: 13, lineHeight: 20 },
});
