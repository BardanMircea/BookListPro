import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppError } from "../app/domain/errors";
import { Livre } from "../app/domain/livre";
import { bookKeys } from "../app/queryKeys/bookKeys";
import { booksService } from "../app/services/api/booksService";

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
      // 1. Invalider les listes pour que le livre disparaisse de l'accueil
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });

      // 2. Annuler toute requête en vol sur cet id et le supprimer du cache
      queryClient.cancelQueries({ queryKey: bookKeys.detail(id) });
      queryClient.removeQueries({ queryKey: bookKeys.detail(id), exact: true });
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
