import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import { useTheme } from "../../context/ThemeContext";
import { shadow } from "../../theme/theme";
import mockApi from "../../store/api";

export default function SendAddressScreen({ navigation }) {
  const { theme } = useTheme();
  const [address, setAddress] = useState("");
  const [recents, setRecents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    mockApi.getRecents().then(setRecents);
  }, []);

  const goToAmount = async (toAddress) => {
    setLoading(true);
    try {
      const receiver = await mockApi.getUserByAddress(toAddress);
      navigation.navigate("SendAmount", { toAddress, receiverName: receiver.name });
    } catch (e) {
      Alert.alert("Not found", e?.response?.data?.message || "That wallet address doesn't exist on ZORO.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Send ZOR" />
      <InputField
        label="Recipient wallet address"
        value={address}
        onChangeText={setAddress}
        placeholder="0xZR..."
        icon="wallet-outline"
      />
      <PrimaryButton title="Continue" onPress={() => goToAmount(address)} loading={loading} disabled={!address} style={{ marginBottom: 20 }} />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("ScanQr")}
        style={[styles.scanRow, { backgroundColor: theme.cardElevated, borderColor: theme.borderSoft }, shadow(theme, "sm")]}
      >
        <Ionicons name="qr-code-outline" size={20} color={theme.gold} />
        <Text style={{ color: theme.foreground, fontWeight: "700", marginLeft: 10 }}>Scan a QR code instead</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Recent contacts</Text>
      <FlatList
        data={recents}
        keyExtractor={(r) => r.address}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => goToAmount(item.address)}
            style={[styles.contactRow, { backgroundColor: theme.card, borderColor: theme.borderSoft }, shadow(theme, "sm")]}
          >
            <View style={[styles.avatar, { backgroundColor: theme.gold }, shadow(theme, "gold")]}>
              <Text style={styles.avatarText}>{item.avatar}</Text>
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: theme.foreground, fontWeight: "700", fontSize: 13 }}>{item.name}</Text>
              <Text numberOfLines={1} style={{ color: theme.muted, fontSize: 11 }}>{item.address}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.muted} />
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scanRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 12 },
  contactRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 14, borderWidth: 1 },
  avatar: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#0A0A0A", fontWeight: "800", fontSize: 13 },
});
