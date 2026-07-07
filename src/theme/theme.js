// theme.js
// Shared visual identity with the ZORO admin panel (see src/app/globals.css there):
// gold (#FBD12D) accent on a near-black canvas, Inter typeface, soft rounded cards.

export const gold = "#FBD12D";
export const goldDark = "#C8A800";
export const black = "#0A0A0A";

export const light = {
  mode: "light",
  background: "#F5F4F0",
  foreground: "#0A0A0A",
  card: "#FFFFFF",
  cardHover: "#FAFAF8",
  cardElevated: "#FFFFFF",
  border: "#E8E6DF",
  borderSoft: "#F0EDE6",
  muted: "#8A8680",
  mutedLight: "#B8B4AE",
  inputBg: "#F8F7F4",
  shadowColor: "#0A0A0A",
  overlay: "rgba(10,10,10,0.55)",
  gold,
  goldDark,
  success: "#16C784",
  warning: "#FACC15",
  danger: "#EF4444",
  info: "#6366F1",
};

export const dark = {
  mode: "dark",
  background: "#0A0A0A",
  foreground: "#FAFAFA",
  card: "#131313",
  cardHover: "#181818",
  cardElevated: "#1A1A1A",
  border: "#232323",
  borderSoft: "#1C1C1C",
  muted: "#8A857C",
  mutedLight: "#57534B",
  inputBg: "#161616",
  shadowColor: "#000000",
  overlay: "rgba(0,0,0,0.65)",
  gold,
  goldDark,
  success: "#16C784",
  warning: "#FACC15",
  danger: "#EF4444",
  info: "#6366F1",
};

// Elevation presets — cross-platform (elevation for Android, shadow* for iOS).
// Use spread: style={[styles.card, shadow(theme, "md")]}
// Pass a third arg to tint the shadow a specific color (e.g. success green)
// instead of the level's default.
export const shadow = (t, level = "md", color) => {
  const presets = {
    sm: { elevation: 2, shadowOpacity: 0.14, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    md: { elevation: 6, shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    lg: { elevation: 12, shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
    gold: { elevation: 10, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
    glow: { elevation: 3, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  };
  const p = presets[level] || presets.md;
  return {
    shadowColor: color || (level === "gold" || level === "glow" ? gold : t.shadowColor),
    shadowOffset: p.shadowOffset,
    shadowOpacity: p.shadowOpacity,
    shadowRadius: p.shadowRadius,
    elevation: p.elevation,
  };
};

// The app defaults to dark (matches the admin login screen and the sidebar's
// permanent near-black background) but every screen reads from context so
// light mode "just works" if it's ever flipped on.
export const defaultTheme = dark;

export const gradients = {
  heroGoldDeep: ["#FFE066", gold, "#D9A600"],
  heroBlack: ["#0A0A0A", "#1a1608"],
  purpleLegacy: ["#6A00F4", "#1A0033"], // kept only as a reference to the Payo lineage
};

export const statusColors = (t) => ({
  active: { color: t.success, bg: `${t.success}1A`, border: `${t.success}33` },
  completed: { color: t.success, bg: `${t.success}1A`, border: `${t.success}33` },
  pending: { color: t.warning, bg: `${t.warning}1A`, border: `${t.warning}33` },
  processing: { color: t.info, bg: `${t.info}1A`, border: `${t.info}33` },
  failed: { color: t.danger, bg: `${t.danger}1A`, border: `${t.danger}33` },
  suspended: { color: t.danger, bg: `${t.danger}1A`, border: `${t.danger}33` },
  frozen: { color: t.info, bg: `${t.info}1A`, border: `${t.info}33` },
  rejected: { color: t.danger, bg: `${t.danger}1A`, border: `${t.danger}33` },
});

export default { light, dark, defaultTheme, gold, goldDark, black, gradients, statusColors, shadow };
