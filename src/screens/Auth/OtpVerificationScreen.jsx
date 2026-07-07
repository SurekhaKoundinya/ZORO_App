import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { shadow } from "../../theme/theme";
import mockApi from "../../store/api";

const LENGTH = 4;

export default function OtpVerificationScreen({ route, navigation }) {
  const { mobile, mode } = route.params || {};
  const { theme } = useTheme();
  const { loginWithOtp } = useAuth();
  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const inputs = useRef([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const setDigit = (val, i) => {
    const next = [...digits];
    next[i] = val.replace(/[^0-9]/g, "").slice(-1);
    setDigits(next);
    if (val && i < LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onVerify = async () => {
    const otp = digits.join("");
    if (otp.length < LENGTH) return Alert.alert("Incomplete code", "Enter the full 4-digit code.");
    setLoading(true);
    try {
      await loginWithOtp(mobile, otp, mode);
      if (mode === "register") {
        navigation.navigate("ProfileSetup", { mobile });
      }
      // mode === "login" — AuthContext flips isAuthenticated and the
      // navigator swaps to the authenticated screen group automatically.
    } catch (e) {
      Alert.alert("Verification failed", e?.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    await mockApi.sendOtp(mobile);
    setSeconds(30);
  };

  return (
    <ScreenContainer>
      <Header title="Verify OTP" showBack />
      <Text style={[styles.sub, { color: theme.muted }]}>
        Enter the 4-digit code sent to {mobile ? `+91 ${mobile}` : "your number"}
      </Text>

      <View style={styles.otpRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(r) => (inputs.current[i] = r)}
            value={d}
            onChangeText={(v) => setDigit(v, i)}
            keyboardType="number-pad"
            maxLength={1}
            style={[
              styles.otpBox,
              { borderColor: d ? theme.gold : theme.border, color: theme.foreground, backgroundColor: theme.inputBg },
              d ? shadow(theme, "glow") : null,
            ]}
          />
        ))}
      </View>

      <PrimaryButton title="Verify" onPress={onVerify} loading={loading} />

      <View style={styles.resendRow}>
        {seconds > 0 ? (
          <Text style={{ color: theme.muted }}>Resend code in {seconds}s</Text>
        ) : (
          <Text onPress={onResend} style={{ color: theme.gold, fontWeight: "700" }}>
            Resend code
          </Text>
        )}
      </View>

      <LoadingOverlay visible={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 14, lineHeight: 20, marginVertical: 20 },
  otpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  otpBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
  },
  resendRow: { alignItems: "center", marginTop: 20 },
  hint: { textAlign: "center", fontSize: 11, marginTop: 30 },
});
