import { noteKeys } from "@/constants/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppError } from "../app/domain/errors";
import { Note, NoteCreateData } from "../app/domain/note";
import { notesService } from "../app/services/api/notesService";

export function useNotes(livreId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Note[], AppError>({
    queryKey: noteKeys.byBook(livreId),
    queryFn: () => notesService.getByBookId(livreId),
    enabled: Boolean(livreId),
  });

  const createMutation = useMutation<Note, AppError, NoteCreateData>({
    mutationFn: (data) => notesService.create(livreId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.byBook(livreId) });
    },
  });

  const deleteMutation = useMutation<null, AppError, string>({
    mutationFn: (noteId) => notesService.delete(livreId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.byBook(livreId) });
    },
  });

  return {
    notes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    addNote: createMutation.mutateAsync,
    isAdding: createMutation.isPending,
    deleteNote: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
