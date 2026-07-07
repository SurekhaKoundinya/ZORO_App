import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

// Each screen sets its own <StatusBar> (light/dark, matched to the active
// theme) via ScreenContainer, so there's no need for a global one here —
// see src/components/ScreenContainer.jsx.
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
