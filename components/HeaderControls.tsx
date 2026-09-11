import { useI18n } from "@/app/i18n/i18n";
import { useAppTheme } from "@/app/theme/ThemeContext";
import { theme } from "@/app/theme/theme";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export const HeaderControls: React.FC = () => {
  const { mode, toggleTheme, colors } = useAppTheme();
  const { language, setLanguage } = useI18n();

  const handleToggleLang = () => {
    setLanguage(language === "fr" ? "en" : "fr");
  };

  return (
    <View style={styles.container}>
      {/* Bascule de langue FR / EN */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleToggleLang}
        accessibilityRole="button"
        accessibilityLabel={`Changer de langue. Langue actuelle : ${language.toUpperCase()}`}
      >
        <Text style={[styles.langText, { color: colors.textPrimary }]}>
          {language.toUpperCase()}
        </Text>
      </Pressable>

      {/* Bascule de thème Clair / Sombre */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={toggleTheme}
        accessibilityRole="button"
        accessibilityLabel={`Basculer le thème. Mode actuel : ${mode === "dark" ? "sombre" : "clair"}`}
      >
        <Text style={styles.iconText}>{mode === "dark" ? "🌙" : "☀️"}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  button: {
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  buttonPressed: {
    opacity: 0.6,
  },
  langText: {
    fontSize: 14,
    fontWeight: "700",
  },
  iconText: {
    fontSize: 18,
  },
});
