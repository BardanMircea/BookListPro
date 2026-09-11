import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppError } from "../app/domain/errors";
import { Livre, LivreSchema } from "../app/domain/livre";
import { bookKeys } from "../app/queryKeys/bookKeys";
import { request } from "../app/services/api/httpClient";

export function useBookRating(livreId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<Livre, AppError, number | null>({
    mutationFn: (note) =>
      request(`/books/${livreId}`, LivreSchema, {
        method: "PATCH",
        body: JSON.stringify({ note }),
      }),
    onSuccess: (updatedBook) => {
      queryClient.setQueryData(bookKeys.detail(livreId), updatedBook);
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
  });

  return {
    setRating: mutation.mutateAsync,
    isRatingPending: mutation.isPending,
  };
}
