import { z } from "zod";
import {
  Note,
  NoteCreateData,
  NoteSchema,
  NotesListSchema,
} from "../../domain/note";
import { request } from "./httpClient";

export const notesService = {
  getByBookId: (livreId: string): Promise<Note[]> => {
    return request(`/books/${livreId}/notes`, NotesListSchema);
  },

  create: (livreId: string, data: NoteCreateData): Promise<Note> => {
    return request(`/books/${livreId}/notes`, NoteSchema, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  delete: (livreId: string, noteId: string): Promise<null> => {
    return request(`/books/${livreId}/notes/${noteId}`, z.null(), {
      method: "DELETE",
    });
  },
};
