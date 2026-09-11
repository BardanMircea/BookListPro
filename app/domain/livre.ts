import { BOOK_MIN_YEAR, BOOK_MAX_YEAR, RATING_MIN, RATING_MAX } from "@/constants/constants";
import { z } from "zod";

export const LivreSchema = z.object({
  id: z.string().uuid(),
  titre: z.string().min(1, "Le titre est obligatoire"),
  auteur: z.string().min(1, "L'auteur est obligatoire"),
  editeur: z.string().min(1, "L'éditeur est obligatoire"),
  annee: z.number().int().min(BOOK_MIN_YEAR).max(BOOK_MAX_YEAR),
  lu: z.boolean(),
  favori: z.boolean(),
  note: z.number().min(RATING_MIN).max(RATING_MAX).nullable(),
  couverture: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int(),
});

export type Livre = z.infer<typeof LivreSchema>;

// Schéma du payload de pagination retourné par GET /books
export const PaginatedBooksSchema = z.object({
  items: z.array(LivreSchema),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type PaginatedBooks = z.infer<typeof PaginatedBooksSchema>;

// Schéma spécifique pour le formulaire de saisie (création / édition complète)
export const LivreFormSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  auteur: z.string().min(1, "L'auteur est requis"),
  editeur: z.string().min(1, "L'éditeur est requis"),
  annee: z
    .number()
    .int()
    .min(BOOK_MIN_YEAR, `Année minimale : ${BOOK_MIN_YEAR}`)
    .max(BOOK_MAX_YEAR, "Année invalide"),
  lu: z.boolean().default(false),
});

export type LivreFormData = z.infer<typeof LivreFormSchema>;
