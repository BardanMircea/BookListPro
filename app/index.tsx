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
import { useI18n } from "./i18n/i18n";
import { useAppTheme } from "./theme/ThemeContext";

export default function BooksListScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useI18n();

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
          description="Aucun ouvrage ne correspond à vos critères."
          actionLabel="Réinitialiser"
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
          <View
            style={[styles.paginationBar, { borderTopColor: colors.border }]}
          >
            <Pressable
              style={[
                styles.pageButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
                !pagination.hasPrevious && { opacity: 0.4 },
              ]}
              onPress={pagination.previousPage}
              disabled={!pagination.hasPrevious}
              accessibilityRole="button"
              accessibilityLabel={t.previous}
            >
              <Text
                style={[styles.pageButtonText, { color: colors.textPrimary }]}
              >
                {t.previous}
              </Text>
            </Pressable>

            <View style={styles.pageInfoContainer}>
              <Text style={[styles.pageInfo, { color: colors.textSecondary }]}>
                {t.pageInfo(pagination.currentPage, pagination.totalPages)}
              </Text>
              {isFetching && !isLoading && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ marginLeft: 6 }}
                />
              )}
            </View>

            <Pressable
              style={[
                styles.pageButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
                !pagination.hasNext && { opacity: 0.4 },
              ]}
              onPress={pagination.nextPage}
              disabled={!pagination.hasNext}
              accessibilityRole="button"
              accessibilityLabel={t.next}
            >
              <Text
                style={[styles.pageButtonText, { color: colors.textPrimary }]}
              >
                {t.next}
              </Text>
            </Pressable>
          </View>
        }
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BookFiltersBar onFiltersChange={setFilters} />

      {renderContent()}

      {/* FAB Ajout */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary },
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => router.push("/books/new")}
        accessibilityRole="button"
        accessibilityLabel={t.addBook}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  pageButton: {
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
  },
  pageButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pageInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pageInfo: {
    fontSize: 13,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  fabText: {
    fontSize: 28,
    color: "#ffffff",
    lineHeight: 30,
    fontWeight: "300",
  },
});
