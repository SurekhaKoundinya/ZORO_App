import React from "react";
import { View, Image, StyleSheet } from "react-native";

// The real image mark (src/assets/zoro-logo.png) — shown on its own with no
// wordmark text, since the mark already reads as a complete logo. Every
// screen that shows the ZORO logo goes through this one component, so
// dropping a new file in place here updates the splash screen, onboarding,
// and login screen all at once.
//
// The source art is 1024x797 (wider than tall, because of the growth-arrow
// flourish), so `size` is treated as the target height and the width is
// derived from the image's own aspect ratio — a fixed square box would
// letterbox it and make the mark look smaller than intended.
const LOGO_ASPECT_RATIO = 1024 / 797;

export default function ZoroLogo({ size = 40 }) {
  return (
    <View style={styles.row}>
      <Image
        source={require("../assets/zoro-logo.png")}
        style={{ width: size * LOGO_ASPECT_RATIO, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
});
