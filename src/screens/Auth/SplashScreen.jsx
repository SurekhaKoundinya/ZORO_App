import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import ZoroLogo from "../../components/ZoroLogo";
import { gradients } from "../../theme/theme";

// Shown only while AuthContext is reading AsyncStorage on cold start — the
// navigator swaps away from this automatically once that resolves.
export default function SplashScreen() {
  return (
    <LinearGradient colors={gradients.heroBlack} style={styles.container}>
      <ZoroLogo size={112} />
      <Text style={styles.tagline}>Send. Save. Grow.</Text>
      <ActivityIndicator color="#FBD12D" style={{ marginTop: 40 }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  tagline: { color: "#8A857C", marginTop: 14, fontSize: 14, letterSpacing: 0.5 },
});
