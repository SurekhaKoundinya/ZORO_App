import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import Card from "../../components/Card";
import { useTheme } from "../../context/ThemeContext";
import mockApi from "../../store/api";

export default function MarketScreen({ navigation }) {
  const { theme } = useTheme();
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    mockApi.getMarketOverview().then((r) => setCoins(r.data));
  }, []);

  return (
    <ScreenContainer noPadding>
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={[styles.header, { color: theme.foreground }]}>Market</Text>
        <Text style={{ color: theme.muted, fontSize: 12, marginBottom: 16 }}>Live demo prices, refreshed on app load</Text>
      </View>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        data={coins}
        keyExtractor={(c) => c.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => {
          const up = item.priceChangePercentage24h >= 0;
          return (
            <TouchableOpacity activeOpacity={0.75} onPress={() => navigation.navigate("CoinDetail", { coin: item })}>
              <Card elevated style={styles.row} noBorder>
                <View style={[styles.avatar, { backgroundColor: `${item.accent}22` }]}>
                  <Text style={{ color: item.accent, fontWeight: "800", fontSize: 12 }}>
                    {item.symbol.slice(0, 3).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: theme.foreground, fontWeight: "700", fontSize: 13 }}>{item.name}</Text>
                  <Text style={{ color: theme.muted, fontSize: 11, textTransform: "uppercase" }}>{item.symbol}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: theme.foreground, fontWeight: "700", fontSize: 13 }}>
                    ${item.price.toLocaleString()}
                  </Text>
                  <View style={styles.changeRow}>
                    <Ionicons name={up ? "caret-up" : "caret-down"} size={11} color={up ? theme.success : theme.danger} />
                    <Text style={{ color: up ? theme.success : theme.danger, fontSize: 11, marginLeft: 2, fontWeight: "700" }}>
                      {Math.abs(item.priceChangePercentage24h).toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: "800", marginTop: 8 },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  changeRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
});
