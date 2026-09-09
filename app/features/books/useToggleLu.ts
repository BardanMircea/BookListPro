import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppError } from "../../domain/errors";
import { booksService } from "../../services/api/booksService";
import { bookKeys } from "./bookKeys";

export function useToggleLu() {
  const queryClient = useQueryClient();

  return useMutation<unknown, AppError, { id: string; lu: boolean }>({
    mutationFn: ({ id, lu }) => booksService.toggleLu(id, lu),
    onSuccess: () => {
      // Invalide toutes les requêtes de liste pour rafraîchir les données à l'écran
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
    },
  });
}
