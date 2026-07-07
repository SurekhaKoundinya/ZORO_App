import React from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import { useTheme } from "../../context/ThemeContext";

export default function SettingsScreen({ navigation }) {
  const { theme, mode, toggleTheme } = useTheme();

  const Row = ({ icon, label, onPress, right }) => (
    <TouchableOpacity onPress={onPress} style={styles.row} disabled={!onPress}>
      <Ionicons name={icon} size={19} color={theme.gold} style={{ marginRight: 14 }} />
      <Text style={{ color: theme.foreground, fontSize: 13, fontWeight: "600", flex: 1 }}>{label}</Text>
      {right}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <Header title="Settings" />

      <Text style={[styles.sectionTitle, { color: theme.muted }]}>Appearance</Text>
      <Card elevated style={{ marginBottom: 20 }}>
        <Row
          icon={mode === "dark" ? "moon" : "sunny"}
          label="Dark mode"
          right={<Switch value={mode === "dark"} onValueChange={toggleTheme} trackColor={{ true: theme.gold }} />}
        />
      </Card>

      <Text style={[styles.sectionTitle, { color: theme.muted }]}>Security</Text>
      <Card elevated style={{ marginBottom: 20 }}>
        <Row icon="keypad-outline" label="Change transaction PIN" onPress={() => navigation.navigate("TransactionPin")} right={<Ionicons name="chevron-forward" size={17} color={theme.muted} />} />
      </Card>

      <Text style={[styles.sectionTitle, { color: theme.muted }]}>About</Text>
      <Card elevated>
        <Row icon="information-circle-outline" label="App version" right={<Text style={{ color: theme.muted, fontSize: 12 }}>1.0.0</Text>} />
        <View style={[styles.divider, { backgroundColor: theme.borderSoft }]} />
        <Row
          icon="document-text-outline"
          label="Terms & privacy"
          onPress={() => Alert.alert("ZORO", "This is a self-contained demo app — no live terms document is hosted yet.")}
          right={<Ionicons name="chevron-forward" size={17} color={theme.muted} />}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  divider: { height: 1 },
});
