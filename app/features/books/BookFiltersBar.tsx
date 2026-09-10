import { theme } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDebounce } from "../../../hooks/useDebounce";
import { BookFilters } from "../../services/api/booksService";

type BookFiltersBarProps = {
  onFiltersChange: (filters: Partial<BookFilters>) => void;
};

export const BookFiltersBar: React.FC<BookFiltersBarProps> = ({
  onFiltersChange,
}) => {
  const [localQuery, setLocalQuery] = useState("");
  const debouncedQuery = useDebounce(localQuery, 300);

  const [status, setStatus] = useState<"all" | "lu" | "nonlu">("all");
  const [favoriOnly, setFavoriOnly] = useState(false);
  const [sortField, setSortField] = useState<
    "titre" | "auteur" | "annee" | "note"
  >("titre");

  // Se déclenche uniquement après 300 ms d'inactivité au clavier
  useEffect(() => {
    onFiltersChange({
      q: debouncedQuery.trim() || undefined,
      status: status === "all" ? undefined : status,
      favori: favoriOnly ? true : undefined,
      sort: sortField,
      page: 1, // On repart en page 1 à chaque modification de filtre
    });
  }, [debouncedQuery, status, favoriOnly, sortField]);

  return (
    <View style={styles.container}>
      {/* Champ de recherche */}
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher par titre ou auteur..."
        placeholderTextColor={theme.colors.textMuted}
        value={localQuery}
        onChangeText={setLocalQuery}
        accessibilityLabel="Recherche de livres"
      />

      {/* Barre de puces déroulantes pour les filtres */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
      >
        {/* Filtre Coups de cœur */}
        <Pressable
          style={[styles.chip, favoriOnly && styles.chipActiveFavorite]}
          onPress={() => setFavoriOnly((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel="Filtrer par coups de cœur"
        >
          <Text
            style={[
              styles.chipText,
              favoriOnly && styles.chipTextActiveFavorite,
            ]}
          >
            ❤️ Coups de cœur
          </Text>
        </Pressable>

        {/* Filtres Statut */}
        <Pressable
          style={[styles.chip, status === "lu" && styles.chipActive]}
          onPress={() => setStatus((prev) => (prev === "lu" ? "all" : "lu"))}
          accessibilityRole="button"
        >
          <Text
            style={[styles.chipText, status === "lu" && styles.chipTextActive]}
          >
            Lus
          </Text>
        </Pressable>

        <Pressable
          style={[styles.chip, status === "nonlu" && styles.chipActive]}
          onPress={() =>
            setStatus((prev) => (prev === "nonlu" ? "all" : "nonlu"))
          }
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.chipText,
              status === "nonlu" && styles.chipTextActive,
            ]}
          >
            À lire
          </Text>
        </Pressable>

        {/* Tri */}
        <Pressable
          style={[styles.chip, sortField === "annee" && styles.chipActive]}
          onPress={() =>
            setSortField((prev) => (prev === "annee" ? "titre" : "annee"))
          }
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.chipText,
              sortField === "annee" && styles.chipTextActive,
            ]}
          >
            Année {sortField === "annee" ? "▼" : ""}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.chip, sortField === "note" && styles.chipActive]}
          onPress={() =>
            setSortField((prev) => (prev === "note" ? "titre" : "note"))
          }
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.chipText,
              sortField === "note" && styles.chipTextActive,
            ]}
          >
            Note {sortField === "note" ? "▼" : ""}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    minHeight: theme.layout.minTouchTarget,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
  },
  chipsRow: {
    flexDirection: "row",
    marginTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
  },
  chipActiveFavorite: {
    backgroundColor: theme.colors.favoriteBg,
    borderWidth: 1,
    borderColor: theme.colors.favorite,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.surface,
  },
  chipTextActiveFavorite: {
    color: theme.colors.favorite,
  },
});
