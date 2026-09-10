import { AppError } from "@/app/domain/errors";
import { Livre } from "@/app/domain/livre";
import { BookForm } from "@/app/features/books/BookForm";
import { bookKeys } from "@/app/features/books/bookKeys";
import { booksService } from "@/app/services/api/booksService";
import { useAppTheme } from "@/app/theme/ThemeContext";
import { useI18n } from "@/app/theme/i18n";
import { theme } from "@/constants/theme";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BookSkeleton } from "../../../components/BookSkeleton";
import { ErrorView } from "../../../components/ErrorView";

export default function EditBookScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors } = useAppTheme();
  const { t, language } = useI18n();

  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Array.isArray(id) ? id[0] : id;

  const [serverError, setServerError] = useState<string | null>(null);

  // 1. Récupération des données existantes
  const {
    data: book,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Livre, AppError>({
    queryKey: bookKeys.detail(bookId),
    queryFn: () => booksService.getById(bookId),
    enabled: Boolean(bookId),
  });

  // 2. Mutation de mise à jour avec gestion de l'en-tête If-Match (version)
  const updateMutation = useMutation<Livre, AppError, LivreFormData>({
    mutationFn: (formData) => {
      if (!book) {
        throw {
          type: "RESEAU",
          message: language === "fr" ? "Livre non chargé" : "Book not loaded",
        } as AppError;
      }
      return booksService.update(bookId, formData, book.version);
    },
    onSuccess: (updatedBook) => {
      queryClient.setQueryData(bookKeys.detail(bookId), updatedBook);
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });

      const successMsg =
        language === "fr"
          ? "Ouvrage mis à jour avec succès."
          : "Book updated successfully.";

      if (Platform.OS === "web") {
        window.alert(successMsg);
        router.back();
      } else {
        Alert.alert(language === "fr" ? "Succès" : "Success", successMsg, [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    },
    onError: (err) => {
      if (err.type === "CONFLIT") {
        setServerError(
          language === "fr"
            ? "Conflit détecté : ce livre a été modifié par ailleurs. Rechargez la fiche."
            : "Conflict detected: this book was modified elsewhere. Please reload.",
        );
      } else if (err.type === "VALIDATION" && err.champs) {
        const details = Object.entries(err.champs)
          .map(([champ, msg]) => `${champ} : ${msg}`)
          .join("\n");
        setServerError(
          `${language === "fr" ? "Erreur de validation" : "Validation error"} :\n${details}`,
        );
      } else {
        setServerError(err.message);
      }
    },
  });

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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.versionTag, { color: colors.textMuted }]}>
        {language === "fr"
          ? `Édition de la version ${book.version}`
          : `Editing version ${book.version}`}
      </Text>

      <BookForm
        defaultValues={{
          titre: book.titre,
          auteur: book.auteur,
          editeur: book.editeur,
          annee: book.annee,
          lu: book.lu,
        }}
        onSubmit={async (data) => {
          setServerError(null);
          await updateMutation.mutateAsync(data);
        }}
        submitLabel={t.editBook}
        isSubmitting={updateMutation.isPending}
        serverError={serverError}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  versionTag: {
    fontSize: 12,
    marginBottom: theme.spacing.sm,
    textAlign: "right",
    fontWeight: "500",
  },
});
