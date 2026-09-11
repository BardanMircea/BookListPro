import { NOTE_MAX_LENGTH } from "@/constants/constants";
import { z } from "zod";

export const NoteSchema = z.object({
  id: z.string().uuid(),
  livreId: z.string().uuid(),
  contenu: z
    .string()
    .min(1, "Le contenu est requis")
    .max(NOTE_MAX_LENGTH, `${NOTE_MAX_LENGTH} caractères maximum`),
  createdAt: z.string().datetime(),
});

export type Note = z.infer<typeof NoteSchema>;

export const NotesListSchema = z.array(NoteSchema);

export const NoteCreateSchema = z.object({
  contenu: z
    .string()
    .min(1, "La note ne peut pas être vide")
    .max(NOTE_MAX_LENGTH, `${NOTE_MAX_LENGTH} caractères maximum`),
});

export type NoteCreateData = z.infer<typeof NoteCreateSchema>;
