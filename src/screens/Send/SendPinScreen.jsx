import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useTheme } from "../../context/ThemeContext";
import { shadow } from "../../theme/theme";
import mockApi from "../../store/api";

const LENGTH = 4;

export default function SendPinScreen({ route, navigation }) {
  const { toAddress, receiverName, amount, note } = route.params || {};
  const { theme } = useTheme();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const onKey = (d) => pin.length < LENGTH && setPin(pin + d);
  const onBack = () => setPin(pin.slice(0, -1));

  const onConfirm = async () => {
    if (pin.length < LENGTH) return;
    setLoading(true);
    try {
      await mockApi.transfer({ amount, toAddress, pin });
      await mockApi.addRecent({ name: receiverName, address: toAddress, avatar: receiverName?.slice(0, 2).toUpperCase() });
      navigation.replace("SendSuccess", { amount, receiverName });
    } catch (e) {
      Alert.alert("Transfer failed", e?.response?.data?.message || "Something went wrong");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Confirm & send" />
      <Card elevated style={{ marginBottom: 24 }}>
        <Row label="To" value={receiverName} theme={theme} />
        <Row label="Amount" value={`${amount} ZOR`} theme={theme} />
        {note ? <Row label="Note" value={note} theme={theme} last /> : <Row label="Note" value="—" theme={theme} last />}
      </Card>

      <Text style={[styles.sub, { color: theme.muted }]}>Enter your transaction PIN to confirm</Text>
      <View style={styles.dotsRow}>
        {Array.from({ length: LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { borderColor: theme.gold, backgroundColor: i < pin.length ? theme.gold : "transparent" },
              i < pin.length && shadow(theme, "glow"),
            ]}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "back"].map((k, i) => (
          <Text
            key={i}
            onPress={() => (k === "back" ? onBack() : k === "" ? null : onKey(String(k)))}
            style={[styles.key, { color: theme.foreground, backgroundColor: theme.cardElevated, borderColor: theme.borderSoft }, k === "" && { opacity: 0 }]}
          >
            {k === "back" ? "⌫" : k}
          </Text>
        ))}
      </View>

      <PrimaryButton title="Confirm & send" onPress={onConfirm} loading={loading} disabled={pin.length < LENGTH} />
      <LoadingOverlay visible={loading} />
    </ScreenContainer>
  );
}

function Row({ label, value, theme, last }) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <Text style={{ color: theme.muted, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: theme.foreground, fontSize: 13, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 13, textAlign: "center", marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  dotsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 30 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, marginHorizontal: 8 },
  keypad: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 24 },
  key: { width: "30%", height: 60, borderRadius: 16, borderWidth: 1, textAlign: "center", textAlignVertical: "center", fontSize: 20, fontWeight: "700", marginBottom: 12, lineHeight: 60 },
  hint: { textAlign: "center", fontSize: 11, marginTop: 14 },
});
