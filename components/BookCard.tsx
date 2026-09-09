import { Livre } from "@/app/domain/livre";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type BookCardProps = {
  livre: Livre;
  onPress: (id: string) => void;
  onToggleLu?: (id: string, lu: boolean) => void;
};

export const BookCard: React.FC<BookCardProps> = ({
  livre,
  onPress,
  onToggleLu,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(livre.id)}
      accessibilityRole="button"
    >
      <View style={styles.headerRow}>
        <Text style={styles.titre} numberOfLines={2}>
          {livre.titre}
        </Text>
        <Pressable
          style={[styles.badge, livre.lu ? styles.badgeLu : styles.badgeNonLu]}
          onPress={() => onToggleLu?.(livre.id, !livre.lu)}
          hitSlop={8}
        >
          <Text
            style={[
              styles.badgeText,
              livre.lu ? styles.badgeTextLu : styles.badgeTextNonLu,
            ]}
          >
            {livre.lu ? "Lu" : "À lire"}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.auteur}>{livre.auteur}</Text>

      <View style={styles.footerRow}>
        <Text style={styles.details}>
          {livre.editeur} • {livre.annee}
        </Text>
        {livre.note !== null && (
          <Text style={styles.note}>★ {livre.note.toFixed(1)}/5</Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: "#f8fafc",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  titre: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  auteur: {
    fontSize: 14,
    color: "#475569",
    marginTop: 4,
    fontStyle: "italic",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
  },
  details: {
    fontSize: 13,
    color: "#64748b",
  },
  note: {
    fontSize: 13,
    fontWeight: "600",
    color: "#d97706",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeLu: {
    backgroundColor: "#dcfce7",
  },
  badgeNonLu: {
    backgroundColor: "#f1f5f9",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeTextLu: {
    color: "#15803d",
  },
  badgeTextNonLu: {
    color: "#64748b",
  },
});
