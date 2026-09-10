import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppError } from "../../domain/errors";
import { PaginatedBooks } from "../../domain/livre";
import { BookFilters, booksService } from "../../services/api/booksService";

export function useBooks() {
  const [filters, setFilters] = useState<BookFilters>({
    page: 1,
    limit: 20,
    sort: "titre",
    order: "asc",
  });

  const query = useQuery<PaginatedBooks, AppError>({
    // La clé de cache dépend directement de l'ensemble des filtres
    queryKey: ["books", "list", filters],
    // signal permet à fetch d'annuler immédiatement la requête HTTP en vol si filters change
    queryFn: ({ signal }) => booksService.getAllFiltered(filters, signal),
  });

  const setPartialFilters = (newFilters: Partial<BookFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const nextPage = () => {
    if (query.data && (filters.page ?? 1) < query.data.totalPages) {
      setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }));
    }
  };

  const previousPage = () => {
    setFilters((prev) => ({
      ...prev,
      page: Math.max((prev.page ?? 1) - 1, 1),
    }));
  };

  return {
    books: query.data?.items ?? [],
    pagination: {
      currentPage: query.data?.page ?? filters.page ?? 1,
      totalPages: query.data?.totalPages ?? 1,
      totalItems: query.data?.total ?? 0,
      hasNext: query.data ? (filters.page ?? 1) < query.data.totalPages : false,
      hasPrevious: (filters.page ?? 1) > 1,
      nextPage,
      previousPage,
    },
    filters,
    setFilters: setPartialFilters,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    isEmpty:
      !query.isLoading && !query.isError && query.data?.items.length === 0,
    refetch: query.refetch,
  };
}
