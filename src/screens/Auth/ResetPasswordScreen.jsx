import React, { useState } from "react";
import { Text, StyleSheet, Alert } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useTheme } from "../../context/ThemeContext";
import mockApi from "../../store/api";

export default function ResetPasswordScreen({ route, navigation }) {
  const { resetToken } = route?.params || {};
  const { theme } = useTheme();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onReset = async () => {
    if (password.length < 6) return Alert.alert("Weak password", "Use at least 6 characters.");
    if (password !== confirm) return Alert.alert("Mismatch", "Passwords do not match.");
    setLoading(true);
    try {
      await mockApi.resetPassword(resetToken, password);
      Alert.alert("Success", "Your password has been reset. Please log in.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Reset password" showBack />
      <Text style={[styles.sub, { color: theme.muted }]}>Choose a new password for your account.</Text>
      <InputField label="New password" value={password} onChangeText={setPassword} placeholder="••••••••" icon="lock-closed-outline" secureTextEntry />
      <InputField label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="••••••••" icon="lock-closed-outline" secureTextEntry />
      <PrimaryButton title="Reset password" onPress={onReset} loading={loading} />
      <LoadingOverlay visible={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 14, lineHeight: 20, marginVertical: 20 },
});
