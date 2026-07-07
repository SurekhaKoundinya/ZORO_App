import React, { useState } from "react";
import { Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function ProfileSetupScreen({ route, navigation }) {
  const { mobile } = route.params || {};
  const { theme } = useTheme();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("India");
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    if (!name || !email) return Alert.alert("Missing details", "Enter your name and email.");
    setLoading(true);
    try {
      await register({ name, email, mobile, country, avatar: name.slice(0, 2).toUpperCase() });
      navigation.navigate("TransactionPin", { firstTime: true });
    } catch (e) {
      Alert.alert("Error", "Could not create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Set up profile" showBack={false} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={[styles.sub, { color: theme.muted }]}>
            Tell us a bit about yourself to finish creating your ZORO wallet.
          </Text>
          <InputField label="Full name" value={name} onChangeText={setName} placeholder="Arjun Mehta" icon="person-outline" autoCapitalize="words" />
          <InputField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" icon="mail-outline" keyboardType="email-address" />
          <InputField label="Country" value={country} onChangeText={setCountry} placeholder="India" icon="earth-outline" autoCapitalize="words" />
          <PrimaryButton title="Continue" onPress={onContinue} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 14, lineHeight: 20, marginVertical: 20 },
});
