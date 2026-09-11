import { useQuery } from "@tanstack/react-query";
import {
  fetchOpenLibraryData,
  OpenLibraryData,
} from "../app/services/api/openLibraryService";

export function useOpenLibrary(titre: string | undefined) {
  return useQuery<OpenLibraryData>({
    queryKey: ["openLibrary", titre],
    queryFn: ({ signal }) => fetchOpenLibraryData(titre ?? "", signal),
    enabled: Boolean(titre && titre.trim().length > 0),
    staleTime: 1000 * 60 * 60 * 24, // Mise en cache 24 heures
    retry: false, // Pas de réessai intempestif sur un service tiers
  });
}
