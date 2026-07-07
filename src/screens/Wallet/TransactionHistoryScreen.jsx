import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import { useTheme } from "../../context/ThemeContext";
import { shadow } from "../../theme/theme";
import mockApi from "../../store/api";

const FILTERS = ["all", "sent", "received"];

export default function TransactionHistoryScreen({ navigation }) {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    mockApi.getTransactionList().then((r) => setTransactions(r.transactions));
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? transactions : transactions.filter((t) => t.type === filter)),
    [transactions, filter]
  );

  return (
    <ScreenContainer>
      <Header title="Transactions" />
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
            style={[
              styles.filterChip,
              { backgroundColor: filter === f ? theme.gold : theme.card, borderColor: filter === f ? theme.gold : theme.borderSoft },
              filter === f && shadow(theme, "gold"),
            ]}
          >
            <Text style={{ color: filter === f ? "#0A0A0A" : theme.foreground, fontWeight: "700", fontSize: 12, textTransform: "capitalize" }}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No transactions" subtitle="Nothing to show for this filter yet." />}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.75} onPress={() => navigation.navigate("TransactionDetail", { id: item.id })}>
            <Card elevated style={styles.row} noBorder>
              <View style={[styles.icon, { backgroundColor: item.type === "received" ? `${theme.success}1A` : `${theme.gold}1A` }]}>
                <Ionicons name={item.type === "received" ? "arrow-down" : "arrow-up"} size={16} color={item.type === "received" ? theme.success : theme.gold} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.name, { color: theme.foreground }]}>{item.counterparty}</Text>
                <Text style={{ color: theme.muted, fontSize: 11 }}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: item.type === "received" ? theme.success : theme.foreground, fontWeight: "700" }}>
                  {item.type === "received" ? "+" : "-"}
                  {item.amount}
                </Text>
                <Text style={{ color: item.status === "failed" ? theme.danger : theme.muted, fontSize: 11, marginTop: 2, textTransform: "capitalize" }}>
                  {item.status}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: "row", marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, borderWidth: 1, marginRight: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 13, fontWeight: "700" },
});
