import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../context/ThemeContext";
import { shadow as shadowFor } from "../theme/theme";

export default function EmptyState({ icon = "file-tray-outline", title, subtitle }) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: theme.cardElevated, borderColor: theme.borderSoft }, shadowFor(theme, "sm")]}>
        <Ionicons name={icon} size={26} color={theme.gold} />
      </View>
      <Text style={[styles.title, { color: theme.foreground }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingVertical: 48 },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 13, textAlign: "center", paddingHorizontal: 30, lineHeight: 19 },
});
