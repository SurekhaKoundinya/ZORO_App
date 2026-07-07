import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../context/ThemeContext";

// Decorative auto-scrolling "live prices" marquee for the Home screen — not
// interactive (it never stops for a tap), purely a bit of ambient motion.
// Renders the coin list twice back-to-back and loops the translateX from 0
// to -rowWidth so the seam between the two copies is invisible.
export default function MarketTicker({ coins = [] }) {
  const { theme } = useTheme();
  const [rowWidth, setRowWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!rowWidth) return undefined;
    translateX.setValue(0);
    const anim = Animated.loop(
      Animated.timing(translateX, {
        toValue: -rowWidth,
        duration: Math.max(9000, rowWidth * 24),
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [rowWidth, translateX]);

  if (!coins.length) return null;

  const renderChip = (c, key) => {
    const up = c.priceChangePercentage24h >= 0;
    return (
      <View
        key={key}
        style={[styles.chip, { backgroundColor: theme.cardElevated, borderColor: theme.borderSoft }]}
      >
        <Text style={{ color: theme.foreground, fontWeight: "800", fontSize: 12 }}>{c.symbol.toUpperCase()}</Text>
        <Text style={{ color: theme.muted, fontSize: 12, marginLeft: 6 }}>${c.price.toLocaleString()}</Text>
        <Ionicons
          name={up ? "caret-up" : "caret-down"}
          size={10}
          color={up ? theme.success : theme.danger}
          style={{ marginLeft: 6 }}
        />
        <Text style={{ color: up ? theme.success : theme.danger, fontSize: 11, fontWeight: "700", marginLeft: 2 }}>
          {Math.abs(c.priceChangePercentage24h).toFixed(1)}%
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.track, { transform: [{ translateX }] }]}>
        <View style={styles.row} onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}>
          {coins.map((c) => renderChip(c, c.id))}
        </View>
        <View style={styles.row}>{coins.map((c) => renderChip(c, `${c.id}-dup`))}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 38, overflow: "hidden", marginBottom: 20 },
  track: { flexDirection: "row" },
  row: { flexDirection: "row", alignItems: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 10,
  },
});
