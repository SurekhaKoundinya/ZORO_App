import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useTheme } from "../../context/ThemeContext";
import mockApi from "../../store/api";

export default function SendAmountScreen({ route, navigation }) {
  const { toAddress, receiverName } = route.params || {};
  const { theme } = useTheme();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    if (!amount || Number(amount) <= 0) return Alert.alert("Invalid amount", "Enter an amount greater than 0.");
    setLoading(true);
    try {
      const preview = await mockApi.transferPreview(toAddress, amount);
      navigation.navigate("SendPin", { toAddress, receiverName, amount, note, preview });
    } catch (e) {
      Alert.alert("Can't continue", e?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Enter amount" />
      <Card elevated style={{ marginBottom: 24 }}>
        <Text style={{ color: theme.muted, fontSize: 12 }}>Sending to</Text>
        <Text style={{ color: theme.foreground, fontWeight: "800", fontSize: 16, marginTop: 4 }}>{receiverName}</Text>
        <Text numberOfLines={1} style={{ color: theme.muted, fontSize: 11, marginTop: 4 }}>{toAddress}</Text>
      </Card>

      <View style={styles.amountWrap}>
        <Text style={[styles.currency, { color: theme.gold }]}>ZOR</Text>
        <InputField value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />
      </View>

      <InputField label="Note (optional)" value={note} onChangeText={setNote} placeholder="What's this for?" icon="chatbubble-ellipses-outline" />

      <PrimaryButton title="Continue" onPress={onContinue} loading={loading} disabled={!amount} />
      <LoadingOverlay visible={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  amountWrap: { marginBottom: 4 },
  currency: { fontSize: 13, fontWeight: "700", marginBottom: 6 },
});
