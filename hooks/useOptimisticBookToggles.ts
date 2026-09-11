import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppError } from "../app/domain/errors";
import { Livre, PaginatedBooks } from "../app/domain/livre";
import { bookKeys } from "../app/queryKeys/bookKeys";
import { booksService } from "../app/services/api/booksService";

export function useOptimisticBookToggles() {
  const queryClient = useQueryClient();

  // 1. Bascule optimiste du statut Lu
  const toggleLuMutation = useMutation<
    Livre,
    AppError,
    { id: string; lu: boolean },
    { previousLists: any; previousDetail: any }
  >({
    mutationFn: ({ id, lu }) => booksService.toggleLu(id, lu),
    onMutate: async ({ id, lu }) => {
      // Bloque les requêtes en cours pour éviter d'écraser notre mise à jour optimiste
      await queryClient.cancelQueries({ queryKey: bookKeys.all });

      const previousLists = queryClient.getQueriesData({
        queryKey: bookKeys.lists(),
      });
      const previousDetail = queryClient.getQueryData<Livre>(
        bookKeys.detail(id),
      );

      // Mise à jour immédiate dans la liste en mémoire
      queryClient.setQueriesData<PaginatedBooks>(
        { queryKey: bookKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === id ? { ...item, lu } : item,
            ),
          };
        },
      );

      // Mise à jour immédiate sur la fiche détaillée
      if (previousDetail) {
        queryClient.setQueryData<Livre>(bookKeys.detail(id), {
          ...previousDetail,
          lu,
        });
      }

      // Retourne le snapshot pour le rollback
      return { previousLists, previousDetail };
    },
    onError: (_err, { id }, context) => {
      // ROLLBACK : restauration de l'état d'origine si l'appel échoue (503 chaos)
      if (context?.previousLists) {
        context.previousLists.forEach(([key, val]: any) =>
          queryClient.setQueryData(key, val),
        );
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(bookKeys.detail(id), context.previousDetail);
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(id) });
    },
  });

  // 2. Bascule optimiste du Coup de cœur (favori)
  const toggleFavoriMutation = useMutation<
    Livre,
    AppError,
    { id: string; favori: boolean },
    { previousLists: any; previousDetail: any }
  >({
    mutationFn: ({ id, favori }) => booksService.toggleFavori(id, favori),
    onMutate: async ({ id, favori }) => {
      await queryClient.cancelQueries({ queryKey: bookKeys.all });

      const previousLists = queryClient.getQueriesData({
        queryKey: bookKeys.lists(),
      });
      const previousDetail = queryClient.getQueryData<Livre>(
        bookKeys.detail(id),
      );

      queryClient.setQueriesData<PaginatedBooks>(
        { queryKey: bookKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === id ? { ...item, favori } : item,
            ),
          };
        },
      );

      if (previousDetail) {
        queryClient.setQueryData<Livre>(bookKeys.detail(id), {
          ...previousDetail,
          favori,
        });
      }

      return { previousLists, previousDetail };
    },
    onError: (_err, { id }, context) => {
      // ROLLBACK
      if (context?.previousLists) {
        context.previousLists.forEach(([key, val]: any) =>
          queryClient.setQueryData(key, val),
        );
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(bookKeys.detail(id), context.previousDetail);
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(id) });
    },
  });

  return {
    toggleLu: (id: string, lu: boolean) => toggleLuMutation.mutate({ id, lu }),
    toggleFavori: (id: string, favori: boolean) =>
      toggleFavoriMutation.mutate({ id, favori }),
  };
}
