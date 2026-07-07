import React, { useRef } from "react";
import { Animated, Pressable, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { shadow as shadowFor } from "../theme/theme";

export default function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "solid", // solid | outline | ghost
  icon,
  style,
}) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  const backgroundColor =
    variant === "solid" ? theme.gold : variant === "outline" ? "transparent" : "transparent";
  const borderColor = variant === "outline" ? theme.gold : "transparent";
  const textColor = variant === "solid" ? "#0A0A0A" : theme.gold;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[
          styles.base,
          {
            backgroundColor,
            borderColor,
            borderWidth: variant === "outline" ? 1.5 : 0,
            opacity: isDisabled ? 0.5 : 1,
          },
          variant === "solid" && !isDisabled && shadowFor(theme, "gold"),
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <View style={styles.content}>
            {icon}
            <Text style={[styles.label, { color: textColor, marginLeft: icon ? 8 : 0 }]}>{title}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  content: { flexDirection: "row", alignItems: "center" },
  label: { fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
});
