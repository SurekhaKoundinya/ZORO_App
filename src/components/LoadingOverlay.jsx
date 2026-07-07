import React from "react";
import { View, ActivityIndicator, StyleSheet, Modal } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { shadow as shadowFor } from "../theme/theme";

export default function LoadingOverlay({ visible }) {
  const { theme } = useTheme();
  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.box, { backgroundColor: theme.cardElevated, borderColor: theme.borderSoft }, shadowFor(theme, "lg")]}>
          <ActivityIndicator color={theme.gold} size="large" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  box: { padding: 26, borderRadius: 20, borderWidth: 1 },
});
