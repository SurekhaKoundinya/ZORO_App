import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { light, dark } from "../theme/theme";

const STORAGE_KEY = "zoro_theme_mode";

const ThemeContext = createContext({
  theme: dark,
  mode: "dark",
  toggleTheme: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState("dark");

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark") {
          setModeState(stored);
        }
      } catch (e) {
        // ignore — default to dark
      }
    })();
  }, []);

  const setMode = useCallback((next) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const theme = mode === "dark" ? dark : light;

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
