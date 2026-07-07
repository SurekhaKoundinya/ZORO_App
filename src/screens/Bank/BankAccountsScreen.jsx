import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import PrimaryButton from "../../components/PrimaryButton";
import { useTheme } from "../../context/ThemeContext";
import mockApi from "../../store/api";

export default function BankAccountsScreen({ navigation }) {
  const { theme } = useTheme();
  const [accounts, setAccounts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      mockApi.getBankAccounts().then(setAccounts);
    }, [])
  );

  return (
    <ScreenContainer noPadding>
      <View style={{ paddingHorizontal: 20 }}>
        <Header title="Linked bank accounts" />
      </View>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, flexGrow: 1 }}
        data={accounts}
        keyExtractor={(a) => a.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <EmptyState icon="business-outline" title="No bank accounts yet" subtitle="Link a bank account to withdraw ZOR to fiat." />
        }
        renderItem={({ item }) => (
          <Card elevated style={styles.row}>
            <View style={[styles.icon, { backgroundColor: theme.cardElevated, borderColor: theme.borderSoft }]}>
              <Ionicons name="business" size={18} color={theme.gold} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: theme.foreground, fontWeight: "700", fontSize: 13 }}>{item.bankName}</Text>
              <Text style={{ color: theme.muted, fontSize: 11, marginTop: 2 }}>•••• {String(item.accountNumber).slice(-4)}</Text>
            </View>
            {item.primary && (
              <View style={[styles.primaryTag, { backgroundColor: `${theme.gold}22` }]}>
                <Text style={{ color: theme.gold, fontSize: 10, fontWeight: "700" }}>PRIMARY</Text>
              </View>
            )}
          </Card>
        )}
        ListFooterComponent={
          <PrimaryButton title="Link new bank account" onPress={() => navigation.navigate("AddBankAccount")} style={{ marginTop: 20, marginBottom: 20 }} />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  icon: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  primaryTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
});
