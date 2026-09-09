// app/books/new.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet } from "react-native";
import { AppError } from "../domain/errors";
import { LivreFormData } from "../domain/livre";
import { BookForm } from "../features/books/BookForm";
import { bookKeys } from "../features/books/bookKeys";
import { booksService } from "../services/api/booksService";

export default function NewBookScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useMutation<unknown, AppError, LivreFormData>({
    mutationFn: (formData) => booksService.create(formData),
    onSuccess: () => {
      // Invalide le cache des listes pour que le nouveau livre apparaisse
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });

      const msg = "Ouvrage créé avec succès !";
      if (Platform.OS === "web") {
        window.alert(msg);
        router.replace("/");
      } else {
        Alert.alert("Succès", msg, [
          { text: "OK", onPress: () => router.replace("/") },
        ]);
      }
    },
    onError: (err) => {
      if (err.type === "VALIDATION" && err.champs) {
        const details = Object.entries(err.champs)
          .map(([champ, msg]) => `${champ} : ${msg}`)
          .join("\n");
        setErrorMessage(`Erreur de validation :\n${details}`);
      } else {
        setErrorMessage(err.message);
      }
    },
  });

  const handleSubmit = async (data: LivreFormData) => {
    setErrorMessage(null);
    await createMutation.mutateAsync(data);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <BookForm
        onSubmit={handleSubmit}
        submitLabel="Enregistrer l'ouvrage"
        isSubmitting={createMutation.isPending}
        serverError={errorMessage}
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
});
