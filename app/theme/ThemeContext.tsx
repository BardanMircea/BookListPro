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

const lightColors: ThemeColors = {
  primary: "#0284c7",
  primaryHover: "#0369a1",
  background: "#f8fafc",
  surface: "#ffffff",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  danger: "#dc2626",
  dangerBg: "#fee2e2",
  dangerBorder: "#fca5a5",
  success: "#15803d",
  successBg: "#dcfce7",
  warning: "#d97706",
  favorite: "#e11d48",
  favoriteBg: "#ffe4e6",
};

const darkColors: ThemeColors = {
  primary: "#38bdf8",
  primaryHover: "#0ea5e9",
  background: "#0f172a",
  surface: "#1e293b",
  textPrimary: "#f8fafc",
  textSecondary: "#cbd5e1",
  textMuted: "#64748b",
  border: "#334155",
  borderLight: "#1e293b",
  danger: "#f87171",
  dangerBg: "#450a0a",
  dangerBorder: "#7f1d1d",
  success: "#4ade80",
  successBg: "#052e16",
  warning: "#fbbf24",
  favorite: "#fb7185",
  favoriteBg: "#4c0519",
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
    systemScheme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    AsyncStorage.getItem("app_theme_mode").then((saved) => {
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
    await AsyncStorage.setItem("app_theme_mode", nextMode);
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
