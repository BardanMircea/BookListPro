import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppError } from "../../domain/errors";
import { PaginatedBooks } from "../../domain/livre";
import { booksService } from "../../services/api/booksService";
import { bookKeys } from "./bookKeys";

const DEFAULT_PAGE_LIMIT = 20;

export function useBooks(initialPage = 1) {
  const [page, setPage] = useState(initialPage);

  const query = useQuery<PaginatedBooks, AppError>({
    queryKey: bookKeys.list(page, DEFAULT_PAGE_LIMIT),
    queryFn: () => booksService.getAll(page, DEFAULT_PAGE_LIMIT),
  });

  const nextPage = () => {
    if (query.data && page < query.data.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const isEmpty =
    !query.isLoading && !query.isError && query.data?.items.length === 0;

  return {
    books: query.data?.items ?? [],
    pagination: {
      currentPage: query.data?.page ?? page,
      totalPages: query.data?.totalPages ?? 1,
      totalItems: query.data?.total ?? 0,
      hasNext: query.data ? page < query.data.totalPages : false,
      hasPrevious: page > 1,
      nextPage,
      previousPage,
    },
    // États requis
    isLoading: query.isLoading,
    isFetching: query.isFetching, // Utile pour afficher un petit rafraîchissement sans bloquer l'écran
    isError: query.isError,
    error: query.error,
    isEmpty,
    refetch: query.refetch,
  };
}
