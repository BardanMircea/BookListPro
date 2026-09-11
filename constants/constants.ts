// Configuration partagée : valeurs fixes, indépendantes des composants et des hooks.
export const API_BASE_URL = "http://localhost:3000";
export const DEFAULT_TIMEOUT_MS = 8000;
export const HTTP_STATUS = {
  NO_CONTENT: 204,
  VALIDATION: 422,
  CONFLICT: 409,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
} as const;

export const SECOND_MS = 1000;
export const SEARCH_DEBOUNCE_MS = 300;
export const DELETE_DELAY_SECONDS = 5;
export const DELETE_DELAY_MS = DELETE_DELAY_SECONDS * SECOND_MS;
export const QUERY_CONFIG = {
  staleTime: 30 * SECOND_MS,
  gcTime: 5 * 60 * SECOND_MS,
  retryCount: 2,
  retryDelayMs: SECOND_MS,
  retryBackoff: 2,
  maxRetryDelayMs: 10 * SECOND_MS,
} as const;

export const FIRST_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_BOOK_FILTERS = {
  page: FIRST_PAGE,
  limit: DEFAULT_PAGE_SIZE,
  sort: "titre",
  order: "asc",
} as const;
export const BOOK_MIN_YEAR = 1450;
export const BOOK_MAX_YEAR = 2027;
export const NOTE_MAX_LENGTH = 1000;
export const RATING_MIN = 0;
export const RATING_MAX = 5;
export const RATING_STARS = Array.from({ length: RATING_MAX }, (_, index) => index + 1);

export const STORAGE_KEYS = { theme: "app_theme_mode", language: "app_language" } as const;
export const DEFAULT_LANGUAGE = "fr";
export const DEFAULT_THEME_MODE = "light";
export const LOCALES = { fr: "fr-FR", en: "en-US" } as const;

export const OPEN_LIBRARY = {
  searchUrl: "https://openlibrary.org/search.json",
  coversUrl: "https://covers.openlibrary.org/b/id",
  searchLimit: 1,
  timeoutMs: 3500,
  staleTime: 24 * 60 * 60 * SECOND_MS,
} as const;
export const DEFAULT_BOOK_COVER = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80";
export const COVER_UPLOAD = {
  width: 600,
  compression: 0.7,
  pickerQuality: 1,
  aspect: [2, 3],
} as const;
export const PARALLAX_HEADER_HEIGHT = 250;
export const DEFAULT_ICON_SIZE = 24;
export const ICON_MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
} as const;

// Préfixes et fabriques des clés de cache. Les filtres complets identifient une liste.
export const bookKeys = {
  all: ["books"] as const,
  lists: () => [...bookKeys.all, "list"] as const,
  list: (filters: object) => [...bookKeys.lists(), filters] as const,
  details: () => [...bookKeys.all, "detail"] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
};
export const noteKeys = {
  all: ["notes"] as const,
  byBook: (livreId: string) => [...noteKeys.all, "book", livreId] as const,
};
export const openLibraryKeys = { byTitle: (titre: string | undefined) => ["openLibrary", titre] as const };

// Palettes et dimensions partagées. Le contexte choisit la palette active.
export const lightColors = {
  primary: "#0284c7",
  primaryHover: "#0369a1",
  background: "#f8fafc",
  surface: "#ffffff",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  danger: "#dc2626",
  dangerBg: "#fee2e2",
  dangerBorder: "#fca5a5",
  success: "#15803d",
  successBg: "#dcfce7",
  warning: "#d97706",
  favorite: "#e11d48",
  favoriteBg: "#ffe4e6",
};

export const darkColors = {
  primary: "#38bdf8",
  primaryHover: "#0ea5e9",
  background: "#0f172a",
  surface: "#1e293b",
  textPrimary: "#f8fafc",
  textSecondary: "#cbd5e1",
  textMuted: "#64748b",
  border: "#334155",
  borderLight: "#1e293b",
  danger: "#f87171",
  dangerBg: "#450a0a",
  dangerBorder: "#7f1d1d",
  success: "#4ade80",
  successBg: "#052e16",
  warning: "#fbbf24",
  favorite: "#fb7185",
  favoriteBg: "#4c0519",
};

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const FONT_FAMILIES = {
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
} as const;

export const theme = {
  colors: lightColors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    full: 9999,
  },
  layout: {
    minTouchTarget: 44, // 44 points minimum imposés pour l'accessibilité
  },
};
