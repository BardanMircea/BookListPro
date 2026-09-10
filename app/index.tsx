import { theme } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BookCard } from "../components/BookCard";
import { BookSkeleton } from "../components/BookSkeleton";
import { EmptyView } from "../components/EmptyView";
import { ErrorView } from "../components/ErrorView";
import { BookFiltersBar } from "./features/books/BookFiltersBar";
import { useBooks } from "./features/books/useBooks";
import { useOptimisticBookToggles } from "./features/books/useOptimisticBookToggles";

export default function BooksListScreen() {
  const router = useRouter();
  const {
    books,
    pagination,
    setFilters,
    isLoading,
    isFetching,
    isError,
    error,
    isEmpty,
    refetch,
  } = useBooks();

  const { toggleLu, toggleFavori } = useOptimisticBookToggles();

  // useCallback conserve la même référence de fonction en mémoire :
  // combiné avec React.memo sur BookCard, cela garantit 0 rendu superflu
  const handlePressBook = useCallback(
    (id: string) => {
      router.push(`/books/${id}`);
    },
    [router],
  );

  const handleToggleLu = useCallback(
    (id: string, lu: boolean) => {
      toggleLu(id, lu);
    },
    [toggleLu],
  );

  const handleToggleFavori = useCallback(
    (id: string, favori: boolean) => {
      toggleFavori(id, favori);
    },
    [toggleFavori],
  );

  const renderContent = () => {
    if (isLoading) {
      return <BookSkeleton count={6} />;
    }

    if (isError) {
      return <ErrorView error={error} onRetry={refetch} />;
    }

    if (isEmpty) {
      return (
        <EmptyView
          titre="Aucun résultat"
          description="Aucun ouvrage ne correspond à vos critères de recherche ou filtres."
          actionLabel="Réinitialiser les filtres"
          onAction={() =>
            setFilters({
              q: undefined,
              status: undefined,
              favori: undefined,
              page: 1,
            })
          }
        />
      );
    }

    return (
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard
            livre={item}
            onPress={handlePressBook}
            onToggleLu={handleToggleLu}
            onToggleFavori={handleToggleFavori}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <View style={styles.paginationBar}>
            <Pressable
              style={[
                styles.pageButton,
                !pagination.hasPrevious && styles.pageButtonDisabled,
              ]}
              onPress={pagination.previousPage}
              disabled={!pagination.hasPrevious}
              accessibilityRole="button"
              accessibilityLabel="Page précédente"
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

            <View style={styles.pageInfoContainer}>
              <Text style={styles.pageInfo}>
                Page {pagination.currentPage} / {pagination.totalPages}
              </Text>
              {isFetching && !isLoading && (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ marginLeft: 6 }}
                />
              )}
            </View>

            <Pressable
              style={[
                styles.pageButton,
                !pagination.hasNext && styles.pageButtonDisabled,
              ]}
              onPress={pagination.nextPage}
              disabled={!pagination.hasNext}
              accessibilityRole="button"
              accessibilityLabel="Page suivante"
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
    );
  };

  return (
    <View style={styles.container}>
      {/* Barre de filtres isolée pour éviter les re-renders de liste à chaque frappe */}
      <BookFiltersBar onFiltersChange={setFilters} />

      {renderContent()}

      {/* Bouton d'action flottant */}
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
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 80,
  },
  paginationBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  pageButton: {
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.textPrimary,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
  },
  pageButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  pageButtonText: {
    color: theme.colors.surface,
    fontSize: 13,
    fontWeight: "600",
  },
  pageButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  pageInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pageInfo: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  fabPressed: {
    backgroundColor: theme.colors.primaryHover,
  },
  fabText: {
    fontSize: 28,
    color: theme.colors.surface,
    lineHeight: 30,
    fontWeight: "300",
  },
});
