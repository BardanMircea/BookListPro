import {
  FIRST_PAGE,
  DEFAULT_BOOK_FILTERS,
  theme,
} from "@/constants/constants";
import { useDebounce } from "@/hooks/useDebounce";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useI18n } from "../app/i18n/i18n";
import { BookFilters } from "../app/services/api/booksService";
import { useAppTheme } from "../app/theme/ThemeContext";

type BookFiltersBarProps = {
  onFiltersChange: (filters: Partial<BookFilters>) => void;
};

export const BookFiltersBar: React.FC<BookFiltersBarProps> = ({
  onFiltersChange,
}) => {
  const { colors } = useAppTheme();
  const { t } = useI18n();

  const [localQuery, setLocalQuery] = useState("");
  const debouncedQuery = useDebounce(localQuery);

  const [status, setStatus] = useState<"all" | "lu" | "nonlu">("all");
  const [favoriOnly, setFavoriOnly] = useState(false);
  const [sortField, setSortField] = useState<
    "titre" | "auteur" | "annee" | "note"
  >(DEFAULT_BOOK_FILTERS.sort);

  useEffect(() => {
    onFiltersChange({
      q: debouncedQuery.trim() || undefined,
      status: status === "all" ? undefined : status,
      favori: favoriOnly ? true : undefined,
      sort: sortField,
      page: FIRST_PAGE,
    });
  }, [debouncedQuery, status, favoriOnly, sortField]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Champ de recherche */}
      <TextInput
        style={[
          styles.searchInput,
          {
            borderColor: colors.border,
            color: colors.textPrimary,
            backgroundColor: colors.background,
          },
        ]}
        placeholder={t.searchPlaceholder}
        placeholderTextColor={colors.textMuted}
        value={localQuery}
        onChangeText={setLocalQuery}
        accessibilityLabel={t.searchPlaceholder}
      />

      {/* Barre de filtres défilante */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
      >
        {/* Favoris */}
        <Pressable
          style={[
            styles.chip,
            { backgroundColor: colors.borderLight },
            favoriOnly && {
              backgroundColor: colors.favoriteBg,
              borderColor: colors.favorite,
              borderWidth: 1,
            },
          ]}
          onPress={() => setFavoriOnly((prev) => !prev)}
        >
          <Text
            style={[
              styles.chipText,
              { color: favoriOnly ? colors.favorite : colors.textSecondary },
            ]}
          >
            {t.favoritesOnly}
          </Text>
        </Pressable>

        {/* Lus */}
        <Pressable
          style={[
            styles.chip,
            { backgroundColor: colors.borderLight },
            status === "lu" && { backgroundColor: colors.primary },
          ]}
          onPress={() => setStatus((prev) => (prev === "lu" ? "all" : "lu"))}
        >
          <Text
            style={[
              styles.chipText,
              { color: status === "lu" ? "#ffffff" : colors.textSecondary },
            ]}
          >
            {t.readStatusRead}
          </Text>
        </Pressable>

        {/* À lire */}
        <Pressable
          style={[
            styles.chip,
            { backgroundColor: colors.borderLight },
            status === "nonlu" && { backgroundColor: colors.primary },
          ]}
          onPress={() =>
            setStatus((prev) => (prev === "nonlu" ? "all" : "nonlu"))
          }
        >
          <Text
            style={[
              styles.chipText,
              { color: status === "nonlu" ? "#ffffff" : colors.textSecondary },
            ]}
          >
            {t.readStatusToRead}
          </Text>
        </Pressable>

        {/* Tri Année */}
        <Pressable
          style={[
            styles.chip,
            { backgroundColor: colors.borderLight },
            sortField === "annee" && { backgroundColor: colors.primary },
          ]}
          onPress={() =>
            setSortField((prev) => (prev === "annee" ? "titre" : "annee"))
          }
        >
          <Text
            style={[
              styles.chipText,
              {
                color: sortField === "annee" ? "#ffffff" : colors.textSecondary,
              },
            ]}
          >
            {t.sortYear} {sortField === "annee" ? "▲" : ""}
          </Text>
        </Pressable>

        {/* Tri Note */}
        <Pressable
          style={[
            styles.chip,
            { backgroundColor: colors.borderLight },
            sortField === "note" && { backgroundColor: colors.primary },
          ]}
          onPress={() =>
            setSortField((prev) => (prev === "note" ? "titre" : "note"))
          }
        >
          <Text
            style={[
              styles.chipText,
              {
                color: sortField === "note" ? "#ffffff" : colors.textSecondary,
              },
            ]}
          >
            {t.sortRating} {sortField === "note" ? "▲" : ""}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  searchInput: {
    minHeight: theme.layout.minTouchTarget,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 14,
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
