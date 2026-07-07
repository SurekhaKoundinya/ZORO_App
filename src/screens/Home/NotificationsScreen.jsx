import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import { useTheme } from "../../context/ThemeContext";
import mockApi from "../../store/api";

const TYPE_ICON = { success: "checkmark-circle", warning: "alert-circle", info: "information-circle" };

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      mockApi.getNotifications().then(setItems);
      mockApi.markAllNotificationsRead();
    }, [])
  );

  return (
    <ScreenContainer>
      <Header title="Notifications" />
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="notifications-outline" title="No notifications yet" subtitle="We'll let you know when something happens." />}
        renderItem={({ item }) => (
          <Card elevated={!item.read} style={styles.row} noBorder={item.read}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor:
                    item.type === "success" ? `${theme.success}1A` : item.type === "warning" ? `${theme.warning}1A` : `${theme.info}1A`,
                },
              ]}
            >
              <Ionicons
                name={TYPE_ICON[item.type] || "notifications"}
                size={18}
                color={item.type === "success" ? theme.success : item.type === "warning" ? theme.warning : theme.info}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.foreground }]}>{item.title}</Text>
              <Text style={{ color: theme.muted, fontSize: 12, marginTop: 3 }}>{item.message}</Text>
              <Text style={{ color: theme.mutedLight, fontSize: 11, marginTop: 6 }}>{item.time}</Text>
            </View>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.gold }]} />}
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start" },
  iconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  title: { fontSize: 13, fontWeight: "700" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8, marginTop: 4 },
});
