import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Platform, PermissionsAndroid } from "react-native";
import { Camera } from "react-native-camera-kit";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import PrimaryButton from "../../components/PrimaryButton";
import { useTheme } from "../../context/ThemeContext";
import mockApi from "../../store/api";

// react-native-camera-kit (bare-workflow replacement for expo-camera) handles
// its own camera session; on Android we still need to ask for the runtime
// CAMERA permission ourselves (iOS prompts automatically off the
// NSCameraUsageDescription entry in Info.plist once one exists).
async function ensureCameraPermission() {
  if (Platform.OS !== "android") return true;
  const already = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
  if (already) return true;
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
    title: "Camera permission",
    message: "ZORO uses your camera to scan QR codes for sending tokens.",
    buttonPositive: "Allow",
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export default function ScanQrScreen({ navigation }) {
  const { theme } = useTheme();
  const [granted, setGranted] = useState(null); // null = checking, true/false = resolved
  const [scanned, setScanned] = useState(false);

  const requestPermission = useCallback(async () => {
    setGranted(await ensureCameraPermission());
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const onScanned = async (event) => {
    if (scanned) return;
    setScanned(true);
    try {
      const data = event?.nativeEvent?.codeStringValue;
      const result = await mockApi.scanQr(data);
      navigation.replace("SendAmount", { toAddress: result.walletAddress, receiverName: result.name });
    } catch (e) {
      setScanned(false);
    }
  };

  if (granted === null) {
    return (
      <ScreenContainer>
        <Header title="Scan QR" />
      </ScreenContainer>
    );
  }

  if (!granted) {
    return (
      <ScreenContainer>
        <Header title="Scan QR" />
        <View style={styles.centered}>
          <Text style={{ color: theme.muted, textAlign: "center", marginBottom: 20 }}>
            Camera access is needed to scan a ZORO wallet QR code.
          </Text>
          <PrimaryButton title="Grant camera access" onPress={requestPermission} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noPadding>
      <View style={{ paddingHorizontal: 20 }}>
        <Header title="Scan QR" />
      </View>
      <View style={styles.cameraWrap}>
        <Camera
          style={StyleSheet.absoluteFillObject}
          scanBarcode
          onReadCode={scanned ? undefined : onScanned}
          showFrame={false}
        />
        <View style={styles.frame} pointerEvents="none">
          <View style={[styles.frameBox, { borderColor: theme.gold }]} />
        </View>
      </View>
      <Text style={[styles.hint, { color: theme.muted }]}>Align the QR code within the frame</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  cameraWrap: { flex: 1, overflow: "hidden" },
  frame: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  frameBox: { width: 240, height: 240, borderWidth: 3, borderRadius: 24 },
  hint: { textAlign: "center", paddingVertical: 20, fontSize: 13 },
});
