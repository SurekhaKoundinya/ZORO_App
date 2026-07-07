import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { CommonActions } from "@react-navigation/native";
import ScreenContainer from "../../components/ScreenContainer";
import PrimaryButton from "../../components/PrimaryButton";
import { useTheme } from "../../context/ThemeContext";
import { shadow } from "../../theme/theme";

export default function SendSuccessScreen({ route, navigation }) {
  const { amount, receiverName } = route.params || {};
  const { theme } = useTheme();

  const onDone = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "Main", params: { screen: "Home" } }] })
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: `${theme.success}1A`, borderColor: `${theme.success}55` },
            shadow(theme, "gold", theme.success),
          ]}
        >
          <Ionicons name="checkmark" size={48} color={theme.success} />
        </View>
        <Text style={[styles.title, { color: theme.foreground }]}>Transfer successful</Text>
        <Text style={[styles.sub, { color: theme.muted }]}>
          You sent {amount} ZOR to {receiverName}
        </Text>
        <PrimaryButton title="Done" onPress={onDone} style={{ width: "100%", marginTop: 40 }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconWrap: { width: 100, height: 100, borderRadius: 30, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  sub: { fontSize: 13, textAlign: "center" },
});
