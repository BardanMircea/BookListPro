import { theme } from "@/app/theme/theme";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { RatingStars } from "../../components/RatingStars";
import { useBookDetail } from "../../hooks/useBookDetail";
import { useBookRating } from "../../hooks/useBookRating";
import { useNotes } from "../../hooks/useNotes";
import { useOpenLibrary } from "../../hooks/useOpenLibrary";
import { useOptimisticBookToggles } from "../../hooks/useOptimisticBookToggles";
import { useI18n } from "../i18n/i18n";
import { bookKeys } from "../queryKeys/bookKeys";
import { coverUploadService } from "../services/coverUploadService";
import { resolveCoverUrl } from "../services/imageResolver";
import { useAppTheme } from "../theme/ThemeContext";

export default function BookDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors } = useAppTheme();
  const { t } = useI18n();

  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Array.isArray(id) ? id[0] : id;

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
  const { setRating } = useBookRating(bookId);
  const { data: openLibraryData, isLoading: isLoadingOL } = useOpenLibrary(
    book?.titre,
  );

  // États locaux
  const [contenuNote, setContenuNote] = useState("");
  const [erreurNote, setErreurNote] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Suppression temporisée réversible (5 s)
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
        router.replace("/");
        await deleteBook(bookId);
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

  // Remplacement de couverture
  const handleChangeCover = async () => {
    try {
      setIsUploadingCover(true);
      const updatedBook = await coverUploadService.pickAndUploadCover(bookId);
      if (updatedBook) {
        queryClient.setQueryData(bookKeys.detail(bookId), updatedBook);
        queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      }
    } catch {
      const errMsg = "Impossible de téléverser cette image.";
      if (Platform.OS === "web") window.alert(errMsg);
      else Alert.alert("Erreur", errMsg);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Rétablissement de la couverture originale
  const handleResetCover = async () => {
    try {
      setIsUploadingCover(true);
      const updatedBook = await coverUploadService.resetCover(bookId);
      queryClient.setQueryData(bookKeys.detail(bookId), updatedBook);
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    } catch {
      const errMsg = "Impossible de réinitialiser la couverture.";
      if (Platform.OS === "web") window.alert(errMsg);
      else Alert.alert("Erreur", errMsg);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Ajout de note
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <BookSkeleton count={1} />
      </View>
    );
  }

  if (isError || !book) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorView error={error} onRetry={refetch} />
      </View>
    );
  }

  const coverUrl = resolveCoverUrl(book.couverture);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Bandeau d'annulation (5 s) */}
      {countdown !== null && (
        <View
          style={[styles.undoBanner, { backgroundColor: colors.textPrimary }]}
        >
          <Text style={[styles.undoText, { color: colors.surface }]}>
            {t.deleteCountdown(countdown)}
          </Text>
          <Pressable
            style={[styles.undoButton, { backgroundColor: colors.favorite }]}
            onPress={cancelPendingDelete}
            accessibilityRole="button"
            accessibilityLabel={t.cancel}
          >
            <Text style={styles.undoButtonText}>{t.cancel}</Text>
          </Pressable>
        </View>
      )}

      {/* Carte principale */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.topRow}>
          {/* Badge Lu */}
          <Pressable
            style={[
              styles.badge,
              {
                backgroundColor: book.lu
                  ? colors.successBg
                  : colors.borderLight,
              },
            ]}
            onPress={() => toggleLu(book.id, !book.lu)}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.badgeText,
                { color: book.lu ? colors.success : colors.textSecondary },
              ]}
            >
              {book.lu ? `✓ ${t.readStatusRead}` : t.readStatusToRead}
            </Text>
          </Pressable>

          {/* Coup de cœur */}
          <Pressable
            style={({ pressed }) => [
              styles.heartButton,
              {
                backgroundColor: book.favori
                  ? colors.favoriteBg
                  : colors.borderLight,
              },
              pressed && { transform: [{ scale: 0.92 }] },
            ]}
            onPress={() => toggleFavori(book.id, !book.favori)}
            accessibilityRole="button"
            accessibilityState={{ selected: book.favori }}
          >
            <Text style={styles.heartIcon}>{book.favori ? "❤️" : "🤍"}</Text>
          </Pressable>
        </View>

        {/* Section Couverture et Métadonnées */}
        <View style={styles.coverAndInfo}>
          <View style={styles.coverWrapper}>
            <Image
              source={{ uri: coverUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
            {isUploadingCover && (
              <View style={styles.coverLoadingOverlay}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
            <View style={styles.coverButtons}>
              <Pressable
                style={[
                  styles.coverActionBtn,
                  { backgroundColor: colors.borderLight },
                ]}
                onPress={handleChangeCover}
                disabled={isUploadingCover}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.coverActionText,
                    { color: colors.textPrimary },
                  ]}
                >
                  {t.changeCover}
                </Text>
              </Pressable>
              {book.couverture && (
                <Pressable
                  style={[
                    styles.coverActionBtn,
                    { backgroundColor: colors.borderLight },
                  ]}
                  onPress={handleResetCover}
                  disabled={isUploadingCover}
                  accessibilityRole="button"
                >
                  <Text
                    style={[styles.coverActionText, { color: colors.danger }]}
                  >
                    {t.restoreCover}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.infoCol}>
            <Text style={[styles.titre, { color: colors.textPrimary }]}>
              {book.titre}
            </Text>
            <Text style={[styles.auteur, { color: colors.textSecondary }]}>
              par {book.auteur}
            </Text>

            <View
              style={[styles.metaBlock, { borderTopColor: colors.borderLight }]}
            >
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                Éditeur :
              </Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                {book.editeur}
              </Text>
            </View>

            <View
              style={[styles.metaBlock, { borderTopColor: colors.borderLight }]}
            >
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                Année :
              </Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                {book.annee}
              </Text>
            </View>

            <View
              style={[styles.metaBlock, { borderTopColor: colors.borderLight }]}
            >
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                Version :
              </Text>
              <Text style={[styles.metaValue, { color: colors.textMuted }]}>
                v{book.version}
              </Text>
            </View>
          </View>
        </View>

        {/* Note interne 0 à 5 avec étoiles */}
        <View
          style={[styles.ratingRow, { borderTopColor: colors.borderLight }]}
        >
          <Text style={[styles.ratingLabel, { color: colors.textPrimary }]}>
            {t.internalRating}
          </Text>
          <RatingStars
            note={book.note}
            onRate={(nouvelleNote) =>
              setRating(nouvelleNote === 0 ? null : nouvelleNote)
            }
          />
        </View>
      </View>

      {/* Bloc OpenLibrary (dégradation silencieuse) */}
      <View
        style={[
          styles.openLibraryCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.olTitle, { color: colors.textPrimary }]}>
          {t.openLibraryTitle}
        </Text>
        {isLoadingOL ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginVertical: 8 }}
          />
        ) : openLibraryData?.trouve ? (
          <View style={styles.olContent}>
            <Text style={[styles.olText, { color: colors.textSecondary }]}>
              {t.openLibraryFound(
                openLibraryData.nombreEditions,
                openLibraryData.premiereAnneePublication,
              )}
            </Text>
            {openLibraryData.couvertureSecoursUrl && !book.couverture && (
              <Image
                source={{ uri: openLibraryData.couvertureSecoursUrl }}
                style={styles.olCover}
                resizeMode="contain"
              />
            )}
          </View>
        ) : (
          <Text style={[styles.olTextMuted, { color: colors.textMuted }]}>
            {t.openLibraryNotFound}
          </Text>
        )}
      </View>

      {/* Boutons d'action Modifier / Supprimer */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push(`/books/edit/${book.id}` as any)}
          disabled={countdown !== null}
          accessibilityRole="button"
          accessibilityLabel={t.editBook}
        >
          <Text style={styles.buttonTextWhite}>{t.editBook}</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            {
              backgroundColor: colors.dangerBg,
              borderColor: colors.dangerBorder,
              borderWidth: 1,
            },
            countdown !== null && { opacity: 0.5 },
          ]}
          onPress={confirmDelete}
          disabled={countdown !== null}
          accessibilityRole="button"
          accessibilityLabel={t.deleteBook}
        >
          <Text style={[styles.buttonTextDanger, { color: colors.danger }]}>
            {t.deleteBook}
          </Text>
        </Pressable>
      </View>

      {/* Section Notes de lecture */}
      <View style={styles.notesSection}>
        <Text style={[styles.notesSectionTitle, { color: colors.textPrimary }]}>
          {t.notesTitle(notes.length)}
        </Text>

        <View
          style={[
            styles.noteInputCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              { color: colors.textPrimary },
              erreurNote
                ? { borderColor: colors.danger, borderWidth: 1 }
                : null,
            ]}
            placeholder={t.notePlaceholder}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            value={contenuNote}
            onChangeText={(text) => {
              setContenuNote(text);
              if (erreurNote) setErreurNote(null);
            }}
            editable={!isAdding}
            accessibilityLabel={t.notePlaceholder}
          />

          {erreurNote && (
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {erreurNote}
            </Text>
          )}

          <View
            style={[
              styles.noteInputFooter,
              { borderTopColor: colors.borderLight },
            ]}
          >
            <Text style={[styles.charCounter, { color: colors.textMuted }]}>
              {contenuNote.length}/1000
            </Text>
            <Pressable
              style={[
                styles.addNoteButton,
                { backgroundColor: colors.primary },
                (!contenuNote.trim() || isAdding) && { opacity: 0.4 },
              ]}
              onPress={handleAddNote}
              disabled={!contenuNote.trim() || isAdding}
              accessibilityRole="button"
              accessibilityLabel={t.publishNote}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.addNoteButtonText}>{t.publishNote}</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Liste des notes */}
        {isLoadingNotes ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : notes.length === 0 ? (
          <View style={styles.emptyNotes}>
            <Text style={[styles.emptyNotesText, { color: colors.textMuted }]}>
              {t.noNotes}
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
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  undoBanner: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  undoText: {
    fontSize: 14,
    fontWeight: "500",
  },
  undoButton: {
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    justifyContent: "center",
  },
  undoButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
  },
  topRow: {
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
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  heartButton: {
    minWidth: theme.layout.minTouchTarget,
    minHeight: theme.layout.minTouchTarget,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: {
    fontSize: 20,
  },
  coverAndInfo: {
    flexDirection: "row",
    gap: theme.spacing.lg,
  },
  coverWrapper: {
    width: 110,
    alignItems: "center",
  },
  coverImage: {
    width: 110,
    height: 165,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#cbd5e1",
  },
  coverLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  coverButtons: {
    marginTop: theme.spacing.sm,
    gap: 4,
    width: "100%",
  },
  coverActionBtn: {
    minHeight: 32,
    borderRadius: theme.borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  coverActionText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  infoCol: {
    flex: 1,
  },
  titre: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  auteur: {
    fontSize: 15,
    fontStyle: "italic",
    marginBottom: theme.spacing.md,
  },
  metaBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  metaLabel: {
    fontSize: 13,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  openLibraryCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    marginTop: theme.spacing.md,
  },
  olTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  olContent: {
    gap: 8,
  },
  olText: {
    fontSize: 13,
  },
  olTextMuted: {
    fontSize: 13,
    fontStyle: "italic",
  },
  olCover: {
    width: 60,
    height: 90,
    borderRadius: theme.borderRadius.sm,
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
  buttonTextWhite: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonTextDanger: {
    fontSize: 15,
    fontWeight: "600",
  },
  notesSection: {
    marginTop: theme.spacing.xxl,
  },
  notesSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },
  noteInputCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
  },
  textInput: {
    minHeight: 70,
    fontSize: 14,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  noteInputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    paddingTop: theme.spacing.sm,
  },
  charCounter: {
    fontSize: 12,
  },
  addNoteButton: {
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  addNoteButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyNotes: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  emptyNotesText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
});
