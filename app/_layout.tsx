import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { AppError } from "./domain/errors";

export default function RootLayout() {
  // useState garantit qu'une seule instance du client existe par cycle de vie de l'application
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // Données fraîches pendant 30 s
            gcTime: 1000 * 60 * 5, // Données conservées en mémoire 5 min
            retry: (failureCount, error: unknown) => {
              const appError = error as AppError;
              // Erreurs non récupérables par un réessai immédiat
              if (
                appError.type === "VALIDATION" ||
                appError.type === "CONFLIT" ||
                appError.type === "AUTH"
              ) {
                return false;
              }
              // Réessaie jusqu'à 2 fois pour les erreurs de type RESEAU (mode chaos 503)
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 10000),
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1e293b" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Cahier de lecture" }} />
        <Stack.Screen
          name="books/[id]"
          options={{ title: "Détail de l’ouvrage" }}
        />
        <Stack.Screen name="books/new" options={{ title: "Nouvel ouvrage" }} />
        <Stack.Screen
          name="books/edit/[id]"
          options={{ title: "Modifier l’ouvrage" }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
