import { QUERY_CONFIG } from "@/constants/constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { HeaderControls } from "../components/HeaderControls";
import { AppError } from "./domain/errors";
import { I18nProvider, useI18n } from "./i18n/i18n";
import { ThemeProvider, useAppTheme } from "./theme/ThemeContext";

function AppNavigationStack() {
  const { colors } = useAppTheme();
  const { t } = useI18n();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: "bold",
          color: colors.textPrimary,
        },
        headerRight: () => <HeaderControls />,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t.appTitle,
        }}
      />
      <Stack.Screen
        name="books/[id]"
        options={{
          title: "", // Laisse le titre propre ou dynamique sur la fiche
        }}
      />
      <Stack.Screen
        name="books/new"
        options={{
          title: t.addBook,
        }}
      />
      <Stack.Screen
        name="books/edit/[id]"
        options={{
          title: t.editBook,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_CONFIG.staleTime,
            gcTime: QUERY_CONFIG.gcTime,
            retry: (failureCount, error: unknown) => {
              const appError = error as AppError;
              if (
                appError.type === "VALIDATION" ||
                appError.type === "CONFLIT" ||
                appError.type === "AUTH"
              ) {
                return false;
              }
              return failureCount < QUERY_CONFIG.retryCount;
            },
            retryDelay: (attemptIndex) =>
              Math.min(QUERY_CONFIG.retryDelayMs * QUERY_CONFIG.retryBackoff ** attemptIndex, QUERY_CONFIG.maxRetryDelayMs),
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <AppNavigationStack />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
