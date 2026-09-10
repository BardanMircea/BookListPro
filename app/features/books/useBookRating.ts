import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppError } from "../../domain/errors";
import { Livre, LivreSchema } from "../../domain/livre";
import { request } from "../../services/api/httpClient";
import { bookKeys } from "./bookKeys";

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
