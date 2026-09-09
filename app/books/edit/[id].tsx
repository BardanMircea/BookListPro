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
import { AppError } from "../../domain/errors";
import { Livre, LivreFormData } from "../../domain/livre";
import { BookForm } from "../../features/books/BookForm";
import { bookKeys } from "../../features/books/bookKeys";
import { booksService } from "../../services/api/booksService";

export default function EditBookScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
      if (!book)
        throw { type: "RESEAU", message: "Livre non chargé" } as AppError;
      return booksService.update(bookId, formData, book.version);
    },
    onSuccess: (updatedBook) => {
      queryClient.setQueryData(bookKeys.detail(bookId), updatedBook);
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });

      const successMsg = "Ouvrage mis à jour avec succès.";
      if (Platform.OS === "web") {
        window.alert(successMsg);
        router.back();
      } else {
        Alert.alert("Succès", successMsg, [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    },
    onError: (err) => {
      if (err.type === "CONFLIT") {
        setServerError(
          "Conflit détecté : ce livre a été modifié par ailleurs. Rechargez la fiche.",
        );
      } else if (err.type === "VALIDATION" && err.champs) {
        const details = Object.entries(err.champs)
          .map(([champ, msg]) => `${champ} : ${msg}`)
          .join("\n");
        setServerError(`Erreur de validation :\n${details}`);
      } else {
        setServerError(err.message);
      }
    },
  });

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
      <Text style={styles.versionTag}>
        Édition de la version {book.version}
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
        submitLabel="Enregistrer les modifications"
        isSubmitting={updateMutation.isPending}
        serverError={serverError}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
  },
  versionTag: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
    textAlign: "right",
  },
});
