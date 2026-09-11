import { DEFAULT_BOOK_FILTERS, FIRST_PAGE, bookKeys } from "@/constants/constants";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppError } from "../app/domain/errors";
import { PaginatedBooks } from "../app/domain/livre";
import { BookFilters, booksService } from "../app/services/api/booksService";

export function useBooks() {
  const [filters, setFilters] = useState<BookFilters>({ ...DEFAULT_BOOK_FILTERS });

  const query = useQuery<PaginatedBooks, AppError>({
    // La clé de cache dépend directement de l'ensemble des filtres
    queryKey: bookKeys.list(filters),
    // signal permet à fetch d'annuler immédiatement la requête HTTP en vol si filters change
    queryFn: ({ signal }) => booksService.getAllFiltered(filters, signal),
  });

  const setPartialFilters = (newFilters: Partial<BookFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const nextPage = () => {
    if (query.data && (filters.page ?? FIRST_PAGE) < query.data.totalPages) {
      setFilters((prev) => ({ ...prev, page: (prev.page ?? FIRST_PAGE) + 1 }));
    }
  };

  const previousPage = () => {
    setFilters((prev) => ({
      ...prev,
      page: Math.max((prev.page ?? FIRST_PAGE) - 1, FIRST_PAGE),
    }));
  };

  return {
    books: query.data?.items ?? [],
    pagination: {
      currentPage: query.data?.page ?? filters.page ?? FIRST_PAGE,
      totalPages: query.data?.totalPages ?? FIRST_PAGE,
      totalItems: query.data?.total ?? 0,
      hasNext: query.data ? (filters.page ?? FIRST_PAGE) < query.data.totalPages : false,
      hasPrevious: (filters.page ?? FIRST_PAGE) > FIRST_PAGE,
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
