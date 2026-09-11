import { lightColors, darkColors, STORAGE_KEYS, DEFAULT_THEME_MODE } from "@/constants/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  primary: string;
  primaryHover: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
  success: string;
  successBg: string;
  warning: string;
  favorite: string;
  favoriteBg: string;
};

type ThemeContextType = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    systemScheme === "dark" ? "dark" : DEFAULT_THEME_MODE,
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.theme).then((saved) => {
      if (saved === "light" || saved === "dark") {
        setMode(saved);
      } else if (systemScheme) {
        setMode(systemScheme);
      }
    });
  }, [systemScheme]);

  const toggleTheme = async () => {
    const nextMode: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(nextMode);
    await AsyncStorage.setItem(STORAGE_KEYS.theme, nextMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colors: mode === "dark" ? darkColors : lightColors,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within a ThemeProvider");
  return ctx;
};
