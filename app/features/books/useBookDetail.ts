import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppError } from "../../domain/errors";
import { Livre } from "../../domain/livre";
import { booksService } from "../../services/api/booksService";
import { bookKeys } from "./bookKeys";

export function useBookDetail(id: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Livre, AppError>({
    queryKey: bookKeys.detail(id),
    queryFn: () => booksService.getById(id),
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation<null, AppError, string>({
    mutationFn: (bookId) => booksService.delete(bookId),
    onSuccess: () => {
      // Invalide la liste des livres et supprime la fiche du cache
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.removeQueries({ queryKey: bookKeys.detail(id) });
    },
  });

  return {
    book: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    deleteBook: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
