import React, { useState } from "react";
import { ScrollView, Alert } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useAuth } from "../../context/AuthContext";
import mockApi from "../../store/api";

export default function EditProfileScreen({ navigation }) {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [country, setCountry] = useState(user?.country || "");
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    setLoading(true);
    try {
      await mockApi.registerProfile({ name, email, mobile, country });
      await refreshProfile();
      Alert.alert("Saved", "Your profile has been updated.", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Edit profile" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <InputField label="Full name" value={name} onChangeText={setName} icon="person-outline" autoCapitalize="words" />
        <InputField label="Email" value={email} onChangeText={setEmail} icon="mail-outline" keyboardType="email-address" />
        <InputField label="Mobile number" value={mobile} onChangeText={setMobile} icon="call-outline" keyboardType="phone-pad" />
        <InputField label="Country" value={country} onChangeText={setCountry} icon="earth-outline" autoCapitalize="words" />
        <PrimaryButton title="Save changes" onPress={onSave} loading={loading} />
      </ScrollView>
      <LoadingOverlay visible={loading} />
    </ScreenContainer>
  );
}
