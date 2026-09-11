import type { Livre, LivreFormData, PaginatedBooks } from '@/app/domain/livre';
import type { Note } from '@/app/domain/note';

export const book: Livre = {
  id: '123e4567-e89b-42d3-a456-426614174000',
  titre: 'Dune', auteur: 'Frank Herbert', editeur: 'Pocket', annee: 1965,
  lu: false, favori: false, note: null, couverture: null,
  createdAt: '2026-01-01T12:00:00.000Z', updatedAt: '2026-01-01T12:00:00.000Z', version: 3,
};
export const bookForm: LivreFormData = {
  titre: book.titre, auteur: book.auteur, editeur: book.editeur, annee: book.annee, lu: false,
};
export const note: Note = {
  id: '123e4567-e89b-42d3-a456-426614174001', livreId: book.id,
  contenu: 'Un univers fascinant.', createdAt: book.createdAt,
};
export const page = (overrides: Partial<PaginatedBooks> = {}): PaginatedBooks => ({
  items: [book], page: 1, limit: 20, total: 1, totalPages: 1, ...overrides,
});

// Seule la frontière réseau est simulée : services et schémas restent réels.
export function reply(payload: unknown, status = 200) {
  const json = jest.fn().mockResolvedValue(payload);
  jest.mocked(fetch).mockResolvedValueOnce({ ok: status >= 200 && status < 300, status, json } as unknown as Response);
  return json;
}
