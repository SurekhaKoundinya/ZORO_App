import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { statusColors } from "../theme/theme";

export default function StatusBadge({ status, label }) {
  const { theme } = useTheme();
  const map = statusColors(theme);
  const config = map[String(status).toLowerCase()] || {
    color: theme.muted,
    bg: theme.border,
    border: theme.border,
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>
        {label || (status ? status.charAt(0).toUpperCase() + status.slice(1) : "")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  text: { fontSize: 12, fontWeight: "700", letterSpacing: 0.2 },
});
