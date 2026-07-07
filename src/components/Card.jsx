import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { shadow as shadowFor } from "../theme/theme";

export default function Card({ children, style, noBorder, elevated, flat }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? theme.cardElevated : theme.card,
          borderColor: noBorder ? "transparent" : theme.borderSoft,
        },
        !flat && shadowFor(theme, elevated ? "md" : "sm"),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
});
