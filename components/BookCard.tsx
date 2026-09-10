// components/BookCard.tsx
import { Livre } from "@/app/domain/livre";
import { theme } from "@/constants/theme";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type BookCardProps = {
  livre: Livre;
  onPress: (id: string) => void;
  onToggleLu?: (id: string, lu: boolean) => void;
  onToggleFavori?: (id: string, favori: boolean) => void;
};

const BookCardComponent: React.FC<BookCardProps> = ({
  livre,
  onPress,
  onToggleLu,
  onToggleFavori,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(livre.id)}
      accessibilityLabel={`${livre.titre}, par ${livre.auteur}`}
    >
      <View style={styles.headerRow}>
        <Text style={styles.titre} numberOfLines={2}>
          {livre.titre}
        </Text>

        <View style={styles.actionsTop}>
          {/* Coup de cœur optimiste (Zone tactile ≥ 44 pt) */}
          <Pressable
            style={({ pressed }) => [
              styles.heartButton,
              livre.favori && styles.heartButtonActive,
              pressed && styles.heartButtonPressed,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavori?.(livre.id, !livre.favori);
            }}
            accessibilityRole="button"
            accessibilityLabel={
              livre.favori
                ? `Retirer ${livre.titre} des coups de cœur`
                : `Ajouter ${livre.titre} aux coups de cœur`
            }
            accessibilityState={{ selected: livre.favori }}
          >
            <Text style={styles.heartIcon}>{livre.favori ? "❤️" : "🤍"}</Text>
          </Pressable>

          {/* Badge Lu optimiste */}
          <Pressable
            style={[
              styles.badge,
              livre.lu ? styles.badgeLu : styles.badgeNonLu,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleLu?.(livre.id, !livre.lu);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Statut de lecture : ${livre.lu ? "Lu" : "À lire"}. Toucher pour modifier.`}
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

// React.memo évite de recalculer ce composant si ses props (livre, callbacks) ne changent pas
export const BookCard = React.memo(BookCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardPressed: {
    backgroundColor: theme.colors.borderLight,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  titre: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    flex: 1,
  },
  actionsTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  heartButton: {
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  heartButtonActive: {
    backgroundColor: theme.colors.favoriteBg,
  },
  heartButtonPressed: {
    transform: [{ scale: 0.9 }],
  },
  heartIcon: {
    fontSize: 18,
  },
  badge: {
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
  },
  badgeLu: {
    backgroundColor: theme.colors.successBg,
  },
  badgeNonLu: {
    backgroundColor: theme.colors.borderLight,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeTextLu: {
    color: theme.colors.success,
  },
  badgeTextNonLu: {
    color: theme.colors.textSecondary,
  },
  auteur: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontStyle: "italic",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.sm,
  },
  details: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  note: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.warning,
  },
});
