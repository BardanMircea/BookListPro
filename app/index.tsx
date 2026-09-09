import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BookCard } from "../components/BookCard";
import { BookSkeleton } from "../components/BookSkeleton";
import { EmptyView } from "../components/EmptyView";
import { ErrorView } from "../components/ErrorView";
import { useBooks } from "./features/books/useBooks";
import { useToggleLu } from "./features/books/useToggleLu";

export default function BooksListScreen() {
  const router = useRouter();
  const {
    books,
    pagination,
    isLoading,
    isFetching,
    isError,
    error,
    isEmpty,
    refetch,
  } = useBooks();

  const toggleLuMutation = useToggleLu();

  // Navigation vers la fiche détaillée
  const handlePressBook = (id: string) => {
    router.push(`/books/${id}`);
  };

  // Basculement rapide du statut lu/non-lu
  const handleToggleLu = (id: string, nextLu: boolean) => {
    toggleLuMutation.mutate({ id, lu: nextLu });
  };

  // 1. État chargement initial -> Squelette
  if (isLoading) {
    return (
      <View style={styles.container}>
        <BookSkeleton count={6} />
      </View>
    );
  }

  // 2. État erreur -> Composant avec bouton réessai
  if (isError) {
    return (
      <View style={styles.container}>
        <ErrorView error={error} onRetry={refetch} />
      </View>
    );
  }

  // 3. État vide -> Message adapté + action d'ajout
  if (isEmpty) {
    return (
      <View style={styles.container}>
        <EmptyView
          titre="Aucun ouvrage répertorié"
          description="Votre fonds est actuellement vide. Commencez par enregistrer un premier livre."
          actionLabel="Ajouter un ouvrage"
          onAction={() => router.push("/books/new")}
        />
      </View>
    );
  }

  // 4. État succès -> Liste paginée
  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard
            livre={item}
            onPress={handlePressBook}
            onToggleLu={handleToggleLu}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
          />
        }
        ListFooterComponent={
          <View style={styles.paginationBar}>
            <Pressable
              style={[
                styles.pageButton,
                !pagination.hasPrevious && styles.pageButtonDisabled,
              ]}
              onPress={pagination.previousPage}
              disabled={!pagination.hasPrevious}
            >
              <Text
                style={[
                  styles.pageButtonText,
                  !pagination.hasPrevious && styles.pageButtonTextDisabled,
                ]}
              >
                Précédent
              </Text>
            </Pressable>

            <Text style={styles.pageInfo}>
              Page {pagination.currentPage} / {pagination.totalPages}
            </Text>

            <Pressable
              style={[
                styles.pageButton,
                !pagination.hasNext && styles.pageButtonDisabled,
              ]}
              onPress={pagination.nextPage}
              disabled={!pagination.hasNext}
            >
              <Text
                style={[
                  styles.pageButtonText,
                  !pagination.hasNext && styles.pageButtonTextDisabled,
                ]}
              >
                Suivant
              </Text>
            </Pressable>
          </View>
        }
      />

      {/* Bouton d'action flottant pour ajouter un livre */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push("/books/new")}
        accessibilityRole="button"
        accessibilityLabel="Ajouter un ouvrage"
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Laisse de l'espace pour le bouton flottant
  },
  paginationBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  pageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#1e293b",
    borderRadius: 6,
  },
  pageButtonDisabled: {
    backgroundColor: "#e2e8f0",
  },
  pageButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  pageButtonTextDisabled: {
    color: "#94a3b8",
  },
  pageInfo: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0284c7",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabPressed: {
    backgroundColor: "#0369a1",
  },
  fabText: {
    fontSize: 28,
    color: "#ffffff",
    lineHeight: 30,
    fontWeight: "300",
  },
});
