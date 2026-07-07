import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useTheme } from "../../context/ThemeContext";
import mockApi from "../../store/api";

export default function ForgotPasswordScreen({ navigation }) {
  const { theme } = useTheme();
  const [step, setStep] = useState("mobile"); // mobile | otp
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const onSendOtp = async () => {
    if (mobile.length < 10) return Alert.alert("Invalid number", "Enter a valid mobile number.");
    setLoading(true);
    try {
      await mockApi.sendPasswordResetOtp(mobile);
      setStep("otp");
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (otp.length < 4) return Alert.alert("Incomplete code", "Enter the 4-digit code.");
    setLoading(true);
    try {
      const res = await mockApi.verifyPasswordResetOtp(mobile, otp);
      navigation.navigate("ResetPassword", { resetToken: res.token });
    } catch (e) {
      Alert.alert("Verification failed", e?.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Forgot password" showBack />
      <Text style={[styles.sub, { color: theme.muted }]}>
        {step === "mobile"
          ? "Enter your registered mobile number to receive a reset code."
          : "Enter the 4-digit code we sent you."}
      </Text>

      {step === "mobile" ? (
        <>
          <InputField label="Mobile number" value={mobile} onChangeText={setMobile} placeholder="98765 43210" icon="call-outline" keyboardType="phone-pad" maxLength={10} />
          <PrimaryButton title="Send reset code" onPress={onSendOtp} loading={loading} />
        </>
      ) : (
        <>
          <InputField label="OTP" value={otp} onChangeText={setOtp} placeholder="1234" icon="keypad-outline" keyboardType="number-pad" maxLength={4} />
          <PrimaryButton title="Verify code" onPress={onVerify} loading={loading} />
        </>
      )}
      <LoadingOverlay visible={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 14, lineHeight: 20, marginVertical: 20 },
});
