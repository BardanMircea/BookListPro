import { z } from "zod";

export const LivreSchema = z.object({
  id: z.string().uuid(),
  titre: z.string().min(1, "Le titre est obligatoire"),
  auteur: z.string().min(1, "L'auteur est obligatoire"),
  editeur: z.string().min(1, "L'éditeur est obligatoire"),
  annee: z.number().int().min(1450).max(2027),
  lu: z.boolean(),
  favori: z.boolean(),
  note: z.number().min(0).max(5).nullable(),
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
    .min(1450, "Année minimale : 1450")
    .max(2027, "Année invalide"),
  lu: z.boolean().default(false),
});

export type LivreFormData = z.infer<typeof LivreFormSchema>;
