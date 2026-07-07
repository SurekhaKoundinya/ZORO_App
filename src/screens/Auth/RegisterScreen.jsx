import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import mockApi from "../../store/api";

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const { setPendingMobile } = useAuth();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    if (mobile.length < 10) return Alert.alert("Invalid number", "Enter a valid 10-digit mobile number.");
    setLoading(true);
    try {
      await mockApi.sendOtp(mobile);
      setPendingMobile(mobile);
      navigation.navigate("OtpVerification", { mobile, mode: "register" });
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Create account" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={[styles.sub, { color: theme.muted }]}>
            We'll text a one-time code to verify your number before setting up your ZORO wallet.
          </Text>
          <InputField
            label="Mobile number"
            value={mobile}
            onChangeText={setMobile}
            placeholder="98765 43210"
            icon="call-outline"
            keyboardType="phone-pad"
            maxLength={10}
          />
          <PrimaryButton title="Send OTP" onPress={onContinue} loading={loading} />

          <View style={styles.footerRow}>
            <Text style={{ color: theme.muted }}>Already have an account? </Text>
            <Text onPress={() => navigation.navigate("Login")} style={{ color: theme.gold, fontWeight: "700" }}>
              Log in
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 14, lineHeight: 20, marginBottom: 24, marginTop: 8 },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
});
