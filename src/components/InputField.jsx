import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../context/ThemeContext";
import { shadow as shadowFor } from "../theme/theme";

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  error,
  icon,
  autoCapitalize = "none",
  maxLength,
  editable = true,
  multiline,
}) {
  const { theme } = useTheme();
  const [secure, setSecure] = useState(!!secureTextEntry);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: theme.muted }]}>{label}</Text> : null}
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.inputBg,
            borderColor: error ? theme.danger : focused ? theme.gold : theme.border,
          },
          focused && !error && shadowFor(theme, "glow"),
        ]}
      >
        {icon ? <Ionicons name={icon} size={18} color={theme.muted} style={{ marginRight: 8 }} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.mutedLight}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          editable={editable}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, { color: theme.foreground }]}
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setSecure((s) => !s)}>
            <Ionicons name={secure ? "eye-off-outline" : "eye-outline"} size={20} color={theme.muted} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  input: { flex: 1, fontSize: 15, height: "100%" },
  error: { fontSize: 12, marginTop: 6 },
});
