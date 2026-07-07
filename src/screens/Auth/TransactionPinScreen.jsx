import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useTheme } from "../../context/ThemeContext";
import { shadow } from "../../theme/theme";
import mockApi from "../../store/api";
import { useAuth } from "../../context/AuthContext";

const LENGTH = 4;

export default function TransactionPinScreen({ route, navigation }) {
  const firstTime = route?.params?.firstTime;
  const { theme } = useTheme();
  const { refreshProfile } = useAuth();
  const [stage, setStage] = useState("create"); // create | confirm
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const current = stage === "create" ? pin : confirmPin;
  const setCurrent = stage === "create" ? setPin : setConfirmPin;

  const onKeyPress = (digit) => {
    if (current.length >= LENGTH) return;
    setCurrent(current + digit);
  };
  const onBackspace = () => setCurrent(current.slice(0, -1));

  const onContinue = async () => {
    if (stage === "create") {
      if (pin.length < LENGTH) return;
      setStage("confirm");
      return;
    }
    if (confirmPin.length < LENGTH) return;
    if (confirmPin !== pin) {
      Alert.alert("PINs don't match", "Try again.");
      setPin("");
      setConfirmPin("");
      setStage("create");
      return;
    }
    setLoading(true);
    try {
      await mockApi.setTransactionPin(pin);
      await refreshProfile();
      if (firstTime) {
        // AuthContext is already authenticated at this point (register() ran
        // before navigating here); nothing further to do — the navigator is
        // already showing the authenticated group with "Main" available.
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
      } else {
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Transaction PIN" showBack={!firstTime} />
      <Text style={[styles.sub, { color: theme.muted }]}>
        {stage === "create" ? "Create a 4-digit PIN to authorize transfers." : "Confirm your PIN."}
      </Text>

      <View style={styles.dotsRow}>
        {Array.from({ length: LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { borderColor: theme.gold, backgroundColor: i < current.length ? theme.gold : "transparent" },
              i < current.length && shadow(theme, "glow"),
            ]}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "back"].map((k, i) => (
          <Text
            key={i}
            onPress={() => (k === "back" ? onBackspace() : k === "" ? null : onKeyPress(String(k)))}
            style={[
              styles.key,
              { color: theme.foreground, backgroundColor: theme.cardElevated, borderColor: theme.borderSoft },
              k === "" && { opacity: 0 },
            ]}
          >
            {k === "back" ? "⌫" : k}
          </Text>
        ))}
      </View>

      <PrimaryButton
        title={stage === "create" ? "Continue" : "Confirm PIN"}
        onPress={onContinue}
        loading={loading}
        disabled={current.length < LENGTH}
      />
      <LoadingOverlay visible={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 14, lineHeight: 20, marginVertical: 20 },
  dotsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 36 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, marginHorizontal: 8 },
  keypad: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 30 },
  key: {
    width: "30%",
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 64,
  },
});
