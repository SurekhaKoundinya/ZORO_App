import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Share } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Ionicons from "react-native-vector-icons/Ionicons";
import Clipboard from "@react-native-clipboard/clipboard";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import { useTheme } from "../../context/ThemeContext";
import { shadow } from "../../theme/theme";
import mockApi from "../../store/api";

export default function ReceiveScreen() {
  const { theme } = useTheme();
  const [address, setAddress] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    mockApi.generateAddress().then((r) => setAddress(r.address));
  }, []);

  const onCopy = async () => {
    if (!address) return;
    Clipboard.setString(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onShare = () => address && Share.share({ message: `Send me ZOR at my ZORO wallet address: ${address}` });

  return (
    <ScreenContainer>
      <Header title="Receive ZOR" />
      <View style={styles.center}>
        <Card elevated style={[styles.qrCard, shadow(theme, "lg")]}>
          {address ? <QRCode value={address} size={200} color={theme.foreground} backgroundColor={theme.cardElevated} /> : null}
        </Card>

        <Text style={[styles.label, { color: theme.muted }]}>Your wallet address</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onCopy}
          style={[styles.addressPill, { backgroundColor: theme.card, borderColor: theme.borderSoft }, shadow(theme, "sm")]}
        >
          <Text numberOfLines={1} style={{ color: theme.foreground, fontSize: 12, fontWeight: "600", flex: 1 }}>
            {address || "—"}
          </Text>
          <Ionicons name={copied ? "checkmark" : "copy-outline"} size={18} color={theme.gold} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onShare}
          style={[styles.shareBtn, { backgroundColor: theme.gold }, shadow(theme, "gold")]}
        >
          <Ionicons name="share-social-outline" size={18} color="#0A0A0A" />
          <Text style={styles.shareText}>Share address</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", marginTop: 20 },
  qrCard: { padding: 24, marginBottom: 24, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 12, marginBottom: 10 },
  addressPill: { flexDirection: "row", alignItems: "center", width: "100%", padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 24 },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, borderRadius: 16, width: "100%" },
  shareText: { color: "#0A0A0A", fontWeight: "700", marginLeft: 8 },
});
