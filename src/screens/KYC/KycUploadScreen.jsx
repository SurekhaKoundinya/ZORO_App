import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useTheme } from "../../context/ThemeContext";
import { shadow } from "../../theme/theme";
import mockApi from "../../store/api";

const DOC_TYPES = ["Passport", "Driving Licence", "National ID"];

// Note: this demo simulates document capture rather than opening the real
// camera/file picker — see ScanQrScreen for an actual react-native-camera-kit integration.
export default function KycUploadScreen({ navigation }) {
  const { theme } = useTheme();
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!frontUploaded || !selfieUploaded) {
      return Alert.alert("Missing documents", "Please add your ID (front) and a selfie to continue.");
    }
    setLoading(true);
    try {
      await mockApi.submitKyc({
        level: "Level 2",
        documents: [
          { type: docType, side: "front" },
          ...(backUploaded ? [{ type: docType, side: "back" }] : []),
          { type: "Selfie", side: "n/a" },
        ],
      });
      navigation.replace("KycStatus");
    } finally {
      setLoading(false);
    }
  };

  const UploadTile = ({ label, done, onPress }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.tile,
        { backgroundColor: done ? `${theme.gold}0D` : theme.card, borderColor: done ? theme.gold : theme.border },
        done && shadow(theme, "glow"),
      ]}
    >
      <Ionicons name={done ? "checkmark-circle" : "cloud-upload-outline"} size={26} color={done ? theme.gold : theme.muted} />
      <Text style={[styles.tileLabel, { color: theme.foreground }]}>{label}</Text>
      <Text style={{ color: theme.muted, fontSize: 12 }}>{done ? "Added" : "Tap to simulate upload"}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <Header title="Upload documents" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Document type</Text>
        <View style={styles.chipsRow}>
          {DOC_TYPES.map((d) => (
            <TouchableOpacity
              key={d}
              activeOpacity={0.8}
              onPress={() => setDocType(d)}
              style={[
                styles.chip,
                {
                  backgroundColor: docType === d ? theme.gold : theme.card,
                  borderColor: docType === d ? theme.gold : theme.borderSoft,
                },
                docType === d && shadow(theme, "gold"),
              ]}
            >
              <Text style={{ color: docType === d ? "#0A0A0A" : theme.foreground, fontWeight: "600", fontSize: 12 }}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card elevated style={{ marginTop: 20, marginBottom: 20 }}>
          <UploadTile label={`${docType} — front`} done={frontUploaded} onPress={() => setFrontUploaded(true)} />
          <View style={{ height: 12 }} />
          <UploadTile label={`${docType} — back (optional)`} done={backUploaded} onPress={() => setBackUploaded(true)} />
          <View style={{ height: 12 }} />
          <UploadTile label="Selfie" done={selfieUploaded} onPress={() => setSelfieUploaded(true)} />
        </Card>

        <Text style={[styles.hint, { color: theme.muted }]}>
          This is a demo flow — tap each tile to simulate attaching a photo. No files leave your device.
        </Text>

        <PrimaryButton title="Submit for review" onPress={onSubmit} loading={loading} style={{ marginTop: 24 }} />
      </ScrollView>
      <LoadingOverlay visible={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 12, marginTop: 6 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, marginRight: 10, marginBottom: 10 },
  tile: { borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed", padding: 16, alignItems: "center" },
  tileLabel: { fontWeight: "700", fontSize: 13, marginTop: 8, marginBottom: 2 },
  hint: { fontSize: 12, lineHeight: 18 },
});
