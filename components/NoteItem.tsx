import { Note } from "@/app/domain/note";
import { theme } from "@/constants/theme";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type NoteItemProps = {
  note: Note;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

export const NoteItem: React.FC<NoteItemProps> = ({
  note,
  onDelete,
  isDeleting,
}) => {
  // Formatage natif français : "10 sept. 2026 à 11:04"
  const dateAffichee = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(note.createdAt));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{dateAffichee}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
          ]}
          onPress={() => onDelete(note.id)}
          disabled={isDeleting}
          accessibilityRole="button"
          accessibilityLabel={`Supprimer la note du ${dateAffichee}`}
          accessibilityHint="Supprime définitivement cette note de lecture"
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </Pressable>
      </View>
      <Text style={styles.contenu}>{note.contenu}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
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
    color: theme.colors.textMuted,
    fontWeight: "500",
  },
  deleteButton: {
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonPressed: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: theme.colors.danger,
    fontSize: 16,
    fontWeight: "bold",
  },
  contenu: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
});
