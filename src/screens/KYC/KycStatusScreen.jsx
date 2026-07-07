import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import PrimaryButton from "../../components/PrimaryButton";
import { useTheme } from "../../context/ThemeContext";
import { shadow } from "../../theme/theme";
import mockApi from "../../store/api";

// Polls every few seconds so the screen visibly flips from "pending" to
// "approved" once the mock backend's simulated reviewer (see submitKyc in
// mockApi.js) finishes — a small touch tying this to the admin panel's
// KYC review queue conceptually, even though nothing real is connected.
export default function KycStatusScreen({ navigation }) {
  const { theme } = useTheme();
  const [status, setStatus] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const poll = () => mockApi.getKycStatus().then(setStatus);
    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (status?.status === "approved" && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [status]);

  const isApproved = status?.status === "approved";
  const isPending = status?.status === "pending";

  return (
    <ScreenContainer>
      <Header title="Verification status" />
      <View style={{ alignItems: "center", marginTop: 30 }}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: isApproved ? `${theme.success}14` : `${theme.gold}14`,
              borderColor: isApproved ? `${theme.success}44` : `${theme.gold}44`,
            },
            shadow(theme, "lg", isApproved ? theme.success : theme.gold),
          ]}
        >
          <Ionicons
            name={isApproved ? "checkmark-circle" : "time-outline"}
            size={48}
            color={isApproved ? theme.success : theme.gold}
          />
        </View>
        <Text style={[styles.title, { color: theme.foreground }]}>
          {isApproved ? "You're verified!" : isPending ? "Review in progress" : "Not submitted"}
        </Text>
        {status ? <StatusBadge status={status.status} /> : null}
        <Text style={[styles.body, { color: theme.muted }]}>
          {isApproved
            ? "Your Level 2 KYC has been approved. Higher limits are now active on your account."
            : isPending
            ? "Our team (the ZORO admin panel) is reviewing your documents. This usually takes a few minutes in this demo."
            : "You haven't submitted a verification request yet."}
        </Text>

        <Card elevated style={{ width: "100%", marginTop: 30 }}>
          <Row label="Level" value={status?.level || "—"} theme={theme} />
          <Row label="Risk score" value={status?.riskScore != null ? String(status.riskScore) : "—"} theme={theme} />
          <Row label="Submitted" value={status?.submittedAt ? new Date(status.submittedAt).toLocaleString() : "—"} theme={theme} last />
        </Card>

        {isApproved && (
          <PrimaryButton title="Done" onPress={() => navigation.popToTop()} style={{ marginTop: 30, width: "100%" }} />
        )}
      </View>
    </ScreenContainer>
  );
}

function Row({ label, value, theme, last }) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <Text style={{ color: theme.muted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: theme.foreground, fontSize: 13, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: { fontSize: 19, fontWeight: "800", marginBottom: 10 },
  body: { fontSize: 13, textAlign: "center", lineHeight: 20, marginTop: 14, paddingHorizontal: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
});
