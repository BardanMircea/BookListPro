import { theme } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BookSkeleton } from "../../components/BookSkeleton";
import { ErrorView } from "../../components/ErrorView";
import { NoteItem } from "../../components/NoteItem";
import { useBookDetail } from "../features/books/useBookDetail";
import { useOptimisticBookToggles } from "../features/books/useOptimisticBookToggles";
import { useNotes } from "../features/notes/useNotes";

export default function BookDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Array.isArray(id) ? id[0] : id;

  // Hooks métier
  const { book, isLoading, isError, error, refetch, deleteBook } =
    useBookDetail(bookId);
  const {
    notes,
    isLoading: isLoadingNotes,
    addNote,
    isAdding,
    deleteNote,
    isDeleting,
  } = useNotes(bookId);
  const { toggleLu, toggleFavori } = useOptimisticBookToggles();

  // État local du formulaire d'ajout de note
  const [contenuNote, setContenuNote] = useState("");
  const [erreurNote, setErreurNote] = useState<string | null>(null);

  // État pour la suppression réversible (5 s)
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startPendingDelete = () => {
    setCountdown(5);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
    }, 1000);

    timerRef.current = setTimeout(async () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      try {
        await deleteBook(bookId);
        router.replace("/");
      } catch {
        if (Platform.OS === "web") {
          window.alert("Impossible de supprimer cet ouvrage.");
        } else {
          Alert.alert("Erreur", "Impossible de supprimer cet ouvrage.");
        }
        setCountdown(null);
      }
    }, 5000);
  };

  const cancelPendingDelete = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
    setCountdown(null);
  };

  const confirmDelete = () => {
    const question = `Êtes-vous sûr de vouloir supprimer "${book?.titre}" ?`;
    if (Platform.OS === "web") {
      if (window.confirm(question)) startPendingDelete();
    } else {
      Alert.alert("Suppression", question, [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: startPendingDelete,
        },
      ]);
    }
  };

  // Ajout de note avec validation
  const handleAddNote = async () => {
    const trimmed = contenuNote.trim();
    if (!trimmed) {
      setErreurNote("La note ne peut pas être vide.");
      return;
    }
    if (trimmed.length > 1000) {
      setErreurNote("1000 caractères maximum.");
      return;
    }

    setErreurNote(null);
    try {
      await addNote({ contenu: trimmed });
      setContenuNote("");
    } catch {
      setErreurNote("Échec de l’enregistrement de la note.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <BookSkeleton count={1} />
      </View>
    );
  }

  if (isError || !book) {
    return (
      <View style={styles.container}>
        <ErrorView error={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Bandeau d'annulation pendant 5 secondes */}
      {countdown !== null && (
        <View style={styles.undoBanner}>
          <Text style={styles.undoText}>Suppression dans {countdown} s...</Text>
          <Pressable
            style={styles.undoButton}
            onPress={cancelPendingDelete}
            accessibilityRole="button"
            accessibilityLabel="Annuler la suppression"
          >
            <Text style={styles.undoButtonText}>ANNULER</Text>
          </Pressable>
        </View>
      )}

      {/* Carte principale */}
      <View style={styles.card}>
        <View style={styles.topBar}>
          {/* Badge Lu optimiste */}
          <Pressable
            style={[styles.badge, book.lu ? styles.badgeLu : styles.badgeNonLu]}
            onPress={() => toggleLu(book.id, !book.lu)}
            accessibilityRole="button"
            accessibilityLabel={`Statut de lecture : ${book.lu ? "Lu" : "À lire"}. Toucher pour basculer.`}
          >
            <Text
              style={[
                styles.badgeText,
                book.lu ? styles.badgeTextLu : styles.badgeTextNonLu,
              ]}
            >
              {book.lu ? "✓ Lu" : "À lire"}
            </Text>
          </Pressable>

          {/* Coup de cœur optimiste (Zone tactile ≥ 44 pt) */}
          <Pressable
            style={({ pressed }) => [
              styles.heartButton,
              book.favori && styles.heartButtonActive,
              pressed && styles.heartButtonPressed,
            ]}
            onPress={() => toggleFavori(book.id, !book.favori)}
            accessibilityRole="button"
            accessibilityLabel={
              book.favori
                ? "Retirer des coups de cœur"
                : "Ajouter aux coups de cœur"
            }
            accessibilityState={{ selected: book.favori }}
          >
            <Text
              style={[styles.heartIcon, book.favori && styles.heartIconActive]}
            >
              {book.favori ? "❤️" : "🤍"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.titre}>{book.titre}</Text>
        <Text style={styles.auteur}>par {book.auteur}</Text>

        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Éditeur :</Text>
          <Text style={styles.metaValue}>{book.editeur}</Text>
        </View>

        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Année de publication :</Text>
          <Text style={styles.metaValue}>{book.annee}</Text>
        </View>

        {book.note !== null && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Note :</Text>
            <Text style={styles.metaValue}>★ {book.note}/5</Text>
          </View>
        )}

        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Version :</Text>
          <Text style={styles.metaValue}>v{book.version}</Text>
        </View>
      </View>

      {/* Actions sur l'ouvrage */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.editButton]}
          onPress={() => router.push(`/books/edit/${book.id}` as any)}
          disabled={countdown !== null}
          accessibilityRole="button"
          accessibilityLabel="Modifier cet ouvrage"
        >
          <Text style={styles.editButtonText}>Modifier la fiche</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.deleteButton,
            countdown !== null && styles.disabledButton,
          ]}
          onPress={confirmDelete}
          disabled={countdown !== null}
          accessibilityRole="button"
          accessibilityLabel="Supprimer cet ouvrage"
        >
          <Text style={styles.deleteButtonText}>Supprimer l'ouvrage</Text>
        </Pressable>
      </View>

      {/* Section Notes de lecture */}
      <View style={styles.notesSection}>
        <Text style={styles.notesSectionTitle}>
          Notes de lecture ({notes.length})
        </Text>

        {/* Formulaire d'ajout rapide */}
        <View style={styles.noteInputCard}>
          <TextInput
            style={[
              styles.textInput,
              erreurNote ? styles.textInputError : null,
            ]}
            placeholder="Ajouter une note de lecture de l'équipe (1000 car. max)..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={3}
            value={contenuNote}
            onChangeText={(text) => {
              setContenuNote(text);
              if (erreurNote) setErreurNote(null);
            }}
            editable={!isAdding}
            accessibilityLabel="Nouvelle note de lecture"
          />

          {erreurNote && <Text style={styles.errorText}>{erreurNote}</Text>}

          <View style={styles.noteInputFooter}>
            <Text style={styles.charCounter}>{contenuNote.length}/1000</Text>
            <Pressable
              style={[
                styles.addNoteButton,
                (!contenuNote.trim() || isAdding) &&
                  styles.addNoteButtonDisabled,
              ]}
              onPress={handleAddNote}
              disabled={!contenuNote.trim() || isAdding}
              accessibilityRole="button"
              accessibilityLabel="Publier la note"
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={theme.colors.surface} />
              ) : (
                <Text style={styles.addNoteButtonText}>Publier la note</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Liste des notes */}
        {isLoadingNotes ? (
          <ActivityIndicator
            color={theme.colors.primary}
            style={{ marginTop: 20 }}
          />
        ) : notes.length === 0 ? (
          <View style={styles.emptyNotes}>
            <Text style={styles.emptyNotesText}>
              Aucune note de lecture pour cet ouvrage. Partagez le premier avis
              !
            </Text>
          </View>
        ) : (
          notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onDelete={deleteNote}
              isDeleting={isDeleting}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  undoBanner: {
    backgroundColor: theme.colors.textPrimary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  undoText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: "500",
  },
  undoButton: {
    backgroundColor: theme.colors.favorite,
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    justifyContent: "center",
  },
  undoButtonText: {
    color: theme.colors.surface,
    fontWeight: "700",
    fontSize: 12,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
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
    fontSize: 13,
    fontWeight: "600",
  },
  badgeTextLu: {
    color: theme.colors.success,
  },
  badgeTextNonLu: {
    color: theme.colors.textSecondary,
  },
  heartButton: {
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.borderLight,
  },
  heartButtonActive: {
    backgroundColor: theme.colors.favoriteBg,
  },
  heartButtonPressed: {
    transform: [{ scale: 0.92 }],
  },
  heartIcon: {
    fontSize: 20,
  },
  heartIconActive: {
    fontSize: 22,
  },
  titre: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  auteur: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
    marginBottom: theme.spacing.lg,
  },
  metaBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  metaLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  actions: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  button: {
    minHeight: theme.layout.minTouchTarget,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  editButtonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: theme.colors.dangerBg,
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
  },
  deleteButtonText: {
    color: theme.colors.danger,
    fontSize: 15,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  notesSection: {
    marginTop: theme.spacing.xxl,
  },
  notesSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  noteInputCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  textInput: {
    minHeight: 80,
    fontSize: 14,
    color: theme.colors.textPrimary,
    textAlignVertical: "top",
  },
  textInputError: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  noteInputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.sm,
  },
  charCounter: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  addNoteButton: {
    backgroundColor: theme.colors.primary,
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  addNoteButtonDisabled: {
    backgroundColor: theme.colors.textMuted,
  },
  addNoteButtonText: {
    color: theme.colors.surface,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyNotes: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  emptyNotesText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
});
