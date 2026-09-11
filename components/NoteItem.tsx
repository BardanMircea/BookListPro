import { Note } from "@/app/domain/note";
import { useI18n } from "@/app/i18n/i18n";
import { useAppTheme } from "@/app/theme/ThemeContext";
import { theme } from "@/constants/theme";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type NoteItemProps = {
  note: Note;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

const NoteItemComponent: React.FC<NoteItemProps> = ({
  note,
  onDelete,
  isDeleting,
}) => {
  const { colors } = useAppTheme();
  const { formatDate, language } = useI18n();

  const formattedDate = formatDate(note.createdAt);
  const deleteLabel =
    language === "fr"
      ? `Supprimer la note du ${formattedDate}`
      : `Delete note from ${formattedDate}`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {formattedDate}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
          ]}
          onPress={() => onDelete(note.id)}
          disabled={isDeleting}
          accessibilityRole="button"
          accessibilityLabel={deleteLabel}
          accessibilityHint={
            language === "fr"
              ? "Supprime définitivement cette note"
              : "Permanently deletes this note"
          }
        >
          <Text style={[styles.deleteButtonText, { color: colors.danger }]}>
            ✕
          </Text>
        </Pressable>
      </View>
      <Text style={[styles.contenu, { color: colors.textPrimary }]}>
        {note.contenu}
      </Text>
    </View>
  );
};

// Mémoïsé pour éviter les re-renders inutiles lors de la frappe dans le formulaire
export const NoteItem = React.memo(NoteItemComponent);

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  date: {
    fontSize: 12,
    fontWeight: "500",
  },
  deleteButton: {
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonPressed: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  contenu: {
    fontSize: 14,
    lineHeight: 20,
  },
});
