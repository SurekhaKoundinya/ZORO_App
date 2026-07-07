import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions, useWindowDimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenContainer from "../../components/ScreenContainer";
import PrimaryButton from "../../components/PrimaryButton";
import ZoroLogo from "../../components/ZoroLogo";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { shadow } from "../../theme/theme";

const SLIDES = [
  {
    icon: "flash",
    title: "Instant ZOR transfers",
    body: "Send and receive ZOR to anyone on the network in seconds, with near-zero fees.",
  },
  {
    icon: "shield-checkmark",
    title: "Verified & secure",
    body: "Complete a quick KYC check to unlock higher limits and full account protection.",
  },
  {
    icon: "gift",
    title: "Earn as you go",
    body: "Refer friends, hit milestones, and collect trading rewards — all tracked in one place.",
  },
];

export default function OnboardingScreen({ navigation }) {
  const { theme } = useTheme();
  const { finishOnboarding } = useAuth();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      setIndex(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      finishOnboarding();
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.top}>
        <ZoroLogo size={40} />
        {index < SLIDES.length - 1 && (
          <Text onPress={() => finishOnboarding()} style={[styles.skip, { color: theme.muted }]}>
            Skip
          </Text>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={{ width: width - 40, alignItems: "center", paddingTop: 40 }}>
            <View style={[styles.iconWrap, { backgroundColor: theme.cardElevated, borderColor: theme.borderSoft }, shadow(theme, "md")]}>
              <Ionicons name={item.icon} size={40} color={theme.gold} />
            </View>
            <Text style={[styles.title, { color: theme.foreground }]}>{item.title}</Text>
            <Text style={[styles.body, { color: theme.muted }]}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === index ? theme.gold : theme.border, width: i === index ? 22 : 8 },
            ]}
          />
        ))}
      </View>

      <PrimaryButton
        title={index === SLIDES.length - 1 ? "Get Started" : "Next"}
        onPress={goNext}
        style={{ marginBottom: 24 }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8 },
  skip: { fontSize: 14, fontWeight: "600" },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 12, paddingHorizontal: 20 },
  body: { fontSize: 14, textAlign: "center", lineHeight: 21, paddingHorizontal: 24 },
  dotsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 24 },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
});
