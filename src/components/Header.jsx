import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { shadow as shadowFor } from "../theme/theme";

export default function Header({ title, showBack = true, right, onBack }) {
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {showBack ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => (onBack ? onBack() : navigation.goBack())}
            style={[styles.iconBtn, { backgroundColor: theme.card, borderColor: theme.borderSoft }, shadowFor(theme, "sm")]}
          >
            <Ionicons name="chevron-back" size={20} color={theme.foreground} />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text numberOfLines={1} style={[styles.title, { color: theme.foreground }]}>
        {title}
      </Text>
      <View style={[styles.side, { alignItems: "flex-end" }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  side: { width: 44 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "800", letterSpacing: 0.2 },
});
