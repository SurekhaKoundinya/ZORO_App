import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Share, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import StatusBadge from "../../components/StatusBadge";
import { useTheme } from "../../context/ThemeContext";
import { shadow } from "../../theme/theme";
import mockApi from "../../store/api";

export default function TransactionDetailScreen({ route }) {
  const { id } = route.params || {};
  const { theme } = useTheme();
  const [tx, setTx] = useState(null);

  useEffect(() => {
    mockApi.getTransactionById(id).then(setTx).catch(() => setTx(null));
  }, [id]);

  const onShare = () => {
    if (!tx) return;
    Share.share({
      message: `ZORO transaction ${tx.id}\n${tx.type === "received" ? "Received from" : "Sent to"} ${tx.counterparty}\nAmount: ${tx.amount} ZOR\nHash: ${tx.hash}`,
    });
  };

  if (!tx) {
    return (
      <ScreenContainer>
        <Header title="Transaction" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header
        title="Transaction detail"
        right={
          <TouchableOpacity onPress={onShare}>
            <Ionicons name="share-outline" size={20} color={theme.foreground} />
          </TouchableOpacity>
        }
      />

      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <View style={[styles.iconWrap, { backgroundColor: theme.cardElevated, borderColor: theme.borderSoft }, shadow(theme, "md")]}>
          <Ionicons
            name={tx.type === "received" ? "arrow-down" : "arrow-up"}
            size={30}
            color={tx.type === "received" ? theme.success : theme.gold}
          />
        </View>
        <Text style={[styles.amount, { color: theme.foreground }]}>
          {tx.type === "received" ? "+" : "-"}
          {tx.amount} ZOR
        </Text>
        <StatusBadge status={tx.status} />
      </View>

      <Card elevated>
        <Row label="Transaction ID" value={tx.id} theme={theme} />
        <Row label={tx.type === "received" ? "From" : "To"} value={tx.counterparty} theme={theme} />
        <Row label="Wallet address" value={tx.address} truncate theme={theme} />
        <Row label="Date & time" value={new Date(tx.createdAt).toLocaleString()} theme={theme} />
        <Row label="Transaction hash" value={tx.hash} truncate theme={theme} last />
      </Card>
    </ScreenContainer>
  );
}

function Row({ label, value, theme, last, truncate }) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.borderSoft }]}>
      <Text style={{ color: theme.muted, fontSize: 12 }}>{label}</Text>
      <Text numberOfLines={1} style={{ color: theme.foreground, fontSize: 12, fontWeight: "600", maxWidth: "60%" }}>
        {truncate ? `${value.slice(0, 10)}…${value.slice(-6)}` : value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 72, height: 72, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  amount: { fontSize: 26, fontWeight: "800", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
});
