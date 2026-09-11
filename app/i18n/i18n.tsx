import { STORAGE_KEYS, NOTE_MAX_LENGTH, DEFAULT_LANGUAGE, LOCALES } from "@/constants/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "fr" | "en";

export const translations = {
  fr: {
    appTitle: "Cahier de lecture",
    searchPlaceholder: "Rechercher par titre ou auteur...",
    favoritesOnly: "❤️ Coups de cœur",
    readStatusAll: "Tous",
    readStatusRead: "Lu",
    readStatusToRead: "À lire",
    sortYear: "Année",
    sortRating: "Note",
    previous: "Précédent",
    next: "Suivant",
    pageInfo: (curr: number, total: number) => `Page ${curr} / ${total}`,
    addBook: "Ajouter un ouvrage",
    editBook: "Modifier la fiche",
    deleteBook: "Supprimer l’ouvrage",
    cancel: "ANNULER",
    deleteCountdown: (sec: number) => `Suppression dans ${sec} s...`,
    notesTitle: (count: number) => `Notes de lecture (${count})`,
    publishNote: "Publier la note",
    noNotes: "Aucune note de lecture pour cet ouvrage.",
    notePlaceholder: `Ajouter une note d’équipe (${NOTE_MAX_LENGTH} car. max)...`,
    internalRating: "Note interne :",
    openLibraryTitle: "Enrichissement bibliographique (OpenLibrary)",
    openLibraryFound: (editions: number, year?: number) =>
      `${editions} édition(s) référencée(s)${year ? ` • 1ère publication en ${year}` : ""}`,
    openLibraryNotFound:
      "Aucune édition référencée sur OpenLibrary pour ce titre.",
    changeCover: "Changer la couverture",
    restoreCover: "Rétablir l’originale",
    themeToggle: "Changer de thème",
  },
  en: {
    appTitle: "Reading Log",
    searchPlaceholder: "Search by title or author...",
    favoritesOnly: "❤️ Favorites",
    readStatusAll: "All",
    readStatusRead: "Read",
    readStatusToRead: "To read",
    sortYear: "Year",
    sortRating: "Rating",
    previous: "Previous",
    next: "Next",
    pageInfo: (curr: number, total: number) => `Page ${curr} of ${total}`,
    addBook: "Add book",
    editBook: "Edit book details",
    deleteBook: "Delete book",
    cancel: "CANCEL",
    deleteCountdown: (sec: number) => `Deleting in ${sec} s...`,
    notesTitle: (count: number) => `Reading notes (${count})`,
    publishNote: "Post note",
    noNotes: "No reading notes yet for this book.",
    notePlaceholder: `Add a staff note (${NOTE_MAX_LENGTH} chars max)...`,
    internalRating: "Internal rating:",
    openLibraryTitle: "Bibliographic data (OpenLibrary)",
    openLibraryFound: (editions: number, year?: number) =>
      `${editions} edition(s) cataloged${year ? ` • First published in ${year}` : ""}`,
    openLibraryNotFound: "No editions cataloged on OpenLibrary for this title.",
    changeCover: "Change cover",
    restoreCover: "Restore original",
    themeToggle: "Toggle theme",
  },
} as const;

type I18nContextType = {
  language: Language;
  t: (typeof translations)[Language];
  setLanguage: (lang: Language) => Promise<void>;
  formatDate: (isoString: string) => string;
  formatNumber: (value: number) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLangState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.language).then((saved) => {
      if (saved === "fr" || saved === "en") setLangState(saved);
    });
  }, []);

  const setLanguage = async (newLang: Language) => {
    setLangState(newLang);
    await AsyncStorage.setItem(STORAGE_KEYS.language, newLang);
  };

  const formatDate = (isoString: string) => {
    return new Intl.DateTimeFormat(LOCALES[language], {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoString));
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat(LOCALES[language]).format(
      value,
    );
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        t: translations[language],
        setLanguage,
        formatDate,
        formatNumber,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
};
