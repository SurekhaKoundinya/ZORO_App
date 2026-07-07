import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import { useTheme } from "../../context/ThemeContext";

// Purely-illustrative price history — this demo has no real time-series
// source, so a small deterministic wave (seeded off the coin id) stands in
// for it, keeping the chart stable across re-renders instead of random noise.
function fakeSeries(seed, base) {
  let x = 0;
  for (let i = 0; i < seed.length; i++) x += seed.charCodeAt(i);
  return Array.from({ length: 7 }, (_, i) => {
    const wave = Math.sin((x + i) * 0.9) * 0.04 + Math.cos((x - i) * 0.5) * 0.02;
    return Number((base * (1 + wave)).toFixed(2));
  });
}

export default function CoinDetailScreen({ route }) {
  const { coin } = route.params || {};
  const { theme } = useTheme();
  const width = Dimensions.get("window").width - 40;

  const series = useMemo(() => (coin ? fakeSeries(coin.id, coin.price) : []), [coin]);
  const up = coin ? coin.priceChangePercentage24h >= 0 : true;

  if (!coin) {
    return (
      <ScreenContainer>
        <Header title="Market" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header title={coin.name} />

      <View style={styles.priceBlock}>
        <Text style={[styles.price, { color: theme.foreground }]}>${coin.price.toLocaleString()}</Text>
        <View style={styles.changeRow}>
          <Ionicons name={up ? "caret-up" : "caret-down"} size={13} color={up ? theme.success : theme.danger} />
          <Text style={{ color: up ? theme.success : theme.danger, fontWeight: "700", marginLeft: 4 }}>
            {Math.abs(coin.priceChangePercentage24h).toFixed(2)}% (7d demo trend)
          </Text>
        </View>
      </View>

      <Card elevated style={{ paddingHorizontal: 4, marginBottom: 20 }}>
        <LineChart
          data={{ labels: ["", "", "", "", "", "", ""], datasets: [{ data: series }] }}
          width={width}
          height={190}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLabels={false}
          withHorizontalLabels={false}
          bezier
          chartConfig={{
            backgroundGradientFrom: theme.cardElevated,
            backgroundGradientTo: theme.cardElevated,
            color: () => coin.accent,
            strokeWidth: 2.5,
          }}
          style={{ marginLeft: -16 }}
        />
      </Card>

      <Card elevated>
        <Row label="Symbol" value={coin.symbol.toUpperCase()} theme={theme} />
        <Row label="Price" value={`$${coin.price.toLocaleString()}`} theme={theme} />
        <Row label="24h change" value={`${coin.priceChangePercentage24h}%`} theme={theme} last />
      </Card>
    </ScreenContainer>
  );
}

function Row({ label, value, theme, last }) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <Text style={{ color: theme.muted, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: theme.foreground, fontSize: 13, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  priceBlock: { marginVertical: 16 },
  price: { fontSize: 28, fontWeight: "800" },
  changeRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
});
