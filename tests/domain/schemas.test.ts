import { LivreFormSchema, LivreSchema, PaginatedBooksSchema } from '@/app/domain/livre';
import { NoteCreateSchema } from '@/app/domain/note';
import { BOOK_MIN_YEAR, BOOK_MAX_YEAR, NOTE_MAX_LENGTH } from '@/constants/constants';
import { book, bookForm, page } from '../helpers/api';

test('applique lu=false lorsque le formulaire ne le précise pas', () => {
  const { lu: _lu, ...input } = bookForm;
  expect(LivreFormSchema.parse(input)).toEqual(bookForm);
});

test.each([
  { titre: '' }, { auteur: '' }, { editeur: '' },
  { annee: BOOK_MIN_YEAR - 1 }, { annee: BOOK_MAX_YEAR + 1 }, { annee: 2000.5 },
])('refuse un formulaire invalide : %j', (override) => {
  expect(LivreFormSchema.safeParse({ ...bookForm, ...override }).success).toBe(false);
});

test.each([BOOK_MIN_YEAR, BOOK_MAX_YEAR])('accepte l’année limite %i', (annee) => {
  expect(LivreFormSchema.safeParse({ ...bookForm, annee }).success).toBe(true);
});

test.each([null, 0, 5])('accepte une note de livre %s', (note) => {
  expect(LivreSchema.safeParse({ ...book, note }).success).toBe(true);
});

test.each([-1, 6])('refuse une note hors limites %i', (note) => {
  expect(LivreSchema.safeParse({ ...book, note }).success).toBe(false);
});

test('accepte une pagination vide mais refuse une page zéro', () => {
  expect(PaginatedBooksSchema.safeParse(page({ items: [], total: 0, totalPages: 0 })).success).toBe(true);
  expect(PaginatedBooksSchema.safeParse(page({ page: 0 })).success).toBe(false);
});

test.each([[0, false], [1, true], [NOTE_MAX_LENGTH, true], [NOTE_MAX_LENGTH + 1, false]])(
  'valide la longueur du contenu : %i caractères', (length, valid) => {
    expect(NoteCreateSchema.safeParse({ contenu: 'a'.repeat(length as number) }).success).toBe(valid);
  },
);
