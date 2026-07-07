import React, { useState } from "react";
import { ScrollView, Alert } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import mockApi from "../../store/api";

export default function AddBankAccountScreen({ navigation }) {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [holderName, setHolderName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!bankName || !accountNumber || !ifsc || !holderName) {
      return Alert.alert("Missing details", "Please fill in all fields.");
    }
    setLoading(true);
    try {
      await mockApi.addBankAccount({ bankName, accountNumber, ifsc, holderName });
      Alert.alert("Bank account linked", "You can now withdraw ZOR to this account.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Link bank account" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <InputField label="Bank name" value={bankName} onChangeText={setBankName} placeholder="HDFC Bank" icon="business-outline" autoCapitalize="words" />
        <InputField label="Account holder name" value={holderName} onChangeText={setHolderName} placeholder="Arjun Mehta" icon="person-outline" autoCapitalize="words" />
        <InputField label="Account number" value={accountNumber} onChangeText={setAccountNumber} placeholder="1234567890" icon="card-outline" keyboardType="number-pad" />
        <InputField label="IFSC code" value={ifsc} onChangeText={(v) => setIfsc(v.toUpperCase())} placeholder="HDFC0001234" icon="key-outline" autoCapitalize="characters" />
        <PrimaryButton title="Save bank account" onPress={onSave} loading={loading} />
      </ScrollView>
      <LoadingOverlay visible={loading} />
    </ScreenContainer>
  );
}
