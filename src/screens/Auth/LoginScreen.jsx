import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import ZoroLogo from "../../components/ZoroLogo";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { shadow } from "../../theme/theme";
import mockApi from "../../store/api";

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const { login, setPendingMobile } = useAuth();
  const [tab, setTab] = useState("password"); // password | otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const onLoginWithPassword = async () => {
    if (!email || !password) return Alert.alert("Missing details", "Enter your email and password.");
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      Alert.alert("Login failed", e?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onLoginWithOtp = async () => {
    if (mobile.length < 10) return Alert.alert("Invalid number", "Enter a valid mobile number.");
    setLoading(true);
    try {
      await mockApi.sendOtp(mobile);
      setPendingMobile(mobile);
      navigation.navigate("OtpVerification", { mobile, mode: "login" });
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: "center", marginTop: 40, marginBottom: 32 }}>
            <ZoroLogo size={64} />
          </View>

          <Text style={[styles.heading, { color: theme.foreground }]}>Welcome back</Text>
          <Text style={[styles.sub, { color: theme.muted }]}>Log in to continue to your ZORO wallet</Text>

          <View style={[styles.tabRow, { backgroundColor: theme.card, borderColor: theme.borderSoft }]}>
            {["password", "otp"].map((t) => (
              <TouchableOpacity
                key={t}
                activeOpacity={0.8}
                onPress={() => setTab(t)}
                style={[styles.tabBtn, tab === t && { backgroundColor: theme.gold }, tab === t && shadow(theme, "sm")]}
              >
                <Text style={[styles.tabLabel, { color: tab === t ? "#0A0A0A" : theme.muted }]}>
                  {t === "password" ? "Email & Password" : "Mobile OTP"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === "password" ? (
            <>
              <InputField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" icon="mail-outline" keyboardType="email-address" />
              <InputField label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" icon="lock-closed-outline" secureTextEntry />
              <Text
                onPress={() => navigation.navigate("ForgotPassword")}
                style={[styles.forgot, { color: theme.gold }]}
              >
                Forgot password?
              </Text>
              <PrimaryButton title="Log In" onPress={onLoginWithPassword} loading={loading} />
            </>
          ) : (
            <>
              <InputField label="Mobile number" value={mobile} onChangeText={setMobile} placeholder="98765 43210" icon="call-outline" keyboardType="phone-pad" maxLength={10} />
              <PrimaryButton title="Send OTP" onPress={onLoginWithOtp} loading={loading} />
            </>
          )}

          <View style={styles.footerRow}>
            <Text style={{ color: theme.muted }}>Don't have an account? </Text>
            <Text onPress={() => navigation.navigate("Register")} style={{ color: theme.gold, fontWeight: "700" }}>
              Sign up
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 26, fontWeight: "800" },
  sub: { fontSize: 14, marginTop: 6, marginBottom: 24 },
  tabRow: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 4, marginBottom: 24 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabLabel: { fontSize: 13, fontWeight: "700" },
  forgot: { textAlign: "right", marginBottom: 20, fontWeight: "600", fontSize: 13 },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
});
