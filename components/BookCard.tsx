import { Livre } from "@/app/domain/livre";
import { useI18n } from "@/app/i18n/i18n";
import { resolveCoverUrl } from "@/app/services/imageResolver";
import { useAppTheme } from "@/app/theme/ThemeContext";
import { RATING_MAX, theme } from "@/constants/constants";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

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
  const { colors } = useAppTheme();
  const { t } = useI18n();

  const coverUrl = resolveCoverUrl(livre.couverture);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.85 },
      ]}
      onPress={() => onPress(livre.id)}
      accessibilityLabel={`${livre.titre}, ${livre.auteur}`}
    >
      <Image
        source={{ uri: coverUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text
            style={[styles.titre, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {livre.titre}
          </Text>

          <View style={styles.actionsTop}>
            {/* Coup de cœur optimiste */}
            <Pressable
              style={({ pressed }) => [
                styles.heartButton,
                {
                  backgroundColor: livre.favori
                    ? colors.favoriteBg
                    : colors.borderLight,
                },
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavori?.(livre.id, !livre.favori);
              }}
              accessibilityRole="button"
              accessibilityLabel={
                livre.favori ? "Retirer favori" : "Ajouter favori"
              }
              accessibilityState={{ selected: livre.favori }}
            >
              <Text style={styles.heartIcon}>{livre.favori ? "❤️" : "🤍"}</Text>
            </Pressable>

            {/* Badge Lu optimiste */}
            <Pressable
              style={[
                styles.badge,
                {
                  backgroundColor: livre.lu
                    ? colors.successBg
                    : colors.borderLight,
                },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                onToggleLu?.(livre.id, !livre.lu);
              }}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: livre.lu ? colors.success : colors.textSecondary },
                ]}
              >
                {livre.lu ? t.readStatusRead : t.readStatusToRead}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.auteur, { color: colors.textSecondary }]}>
          {livre.auteur}
        </Text>

        <View
          style={[styles.footerRow, { borderTopColor: colors.borderLight }]}
        >
          <Text style={[styles.details, { color: colors.textMuted }]}>
            {livre.editeur} • {livre.annee}
          </Text>
          {livre.note !== null && (
            <Text style={[styles.note, { color: colors.warning }]}>
              ★ {livre.note.toFixed(1)}/{RATING_MAX}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export const BookCard = React.memo(BookCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 90,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: "#cbd5e1",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.xs,
  },
  titre: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  actionsTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heartButton: {
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: {
    fontSize: 16,
  },
  badge: {
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  auteur: {
    fontSize: 13,
    marginTop: 2,
    fontStyle: "italic",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    paddingTop: 6,
  },
  details: {
    fontSize: 12,
  },
  note: {
    fontSize: 12,
    fontWeight: "600",
  },
});
