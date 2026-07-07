import React from "react";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../context/ThemeContext";

// Consistent full-screen wrapper: correct status bar style per theme mode,
// safe-area padding, and the app's background color — every screen uses this
// instead of repeating the same boilerplate (mirrors Payo's screen shell).
export default function ScreenContainer({ children, style, edges, noPadding, glow = true }) {
  const { theme, mode } = useTheme();
  return (
    <SafeAreaView
      edges={edges || ["top", "left", "right"]}
      style={[styles.container, { backgroundColor: theme.background }, style]}
    >
      <StatusBar
        barStyle={mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
        translucent={Platform.OS === "android"}
      />
      {glow && mode === "dark" ? (
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(251,209,45,0.10)", "rgba(251,209,45,0)"]}
          style={styles.topGlow}
        />
      ) : null}
      <View style={[styles.body, !noPadding && styles.padded]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1 },
  padded: { paddingHorizontal: 20 },
  topGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 220 },
});
