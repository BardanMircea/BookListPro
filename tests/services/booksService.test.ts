import { booksService } from '@/app/services/api/booksService';
import { API_BASE_URL } from '@/constants/constants';
import { book, bookForm, page, reply } from '../helpers/api';

test('charge la pagination par défaut puis une page explicite', async () => {
  reply(page());
  await expect(booksService.getAll()).resolves.toEqual(page());
  expect(fetch).toHaveBeenLastCalledWith(`${API_BASE_URL}/books?page=1&limit=20`, expect.anything());
  reply(page({ page: 2, limit: 5 }));
  await booksService.getAll(2, 5);
  expect(fetch).toHaveBeenLastCalledWith(`${API_BASE_URL}/books?page=2&limit=5`, expect.anything());
});

test('encode la recherche et conserve favori=false avec tous les filtres', async () => {
  reply(page());
  await booksService.getAllFiltered({ page: 2, limit: 5, q: 'été & mer', status: 'nonlu', favori: false, sort: 'annee', order: 'desc' });
  const url = new URL(String(jest.mocked(fetch).mock.calls[0][0]));
  expect(Object.fromEntries(url.searchParams)).toEqual({ page: '2', limit: '5', q: 'été & mer', status: 'nonlu', favori: 'false', sort: 'annee', order: 'desc' });
});

test('charge un livre par son identifiant', async () => {
  reply(book);
  await expect(booksService.getById(book.id)).resolves.toEqual(book);
  expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/books/${book.id}`, expect.anything());
});

test('crée un livre avec le formulaire JSON', async () => {
  reply(book, 201);
  await expect(booksService.create(bookForm)).resolves.toEqual(book);
  expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/books`, expect.objectContaining({ method: 'POST', body: JSON.stringify(bookForm) }));
});

test('envoie la version en If-Match et remonte un conflit sans le masquer', async () => {
  reply({ versionAttendue: 4, message: 'Modifié ailleurs' }, 409);
  await expect(booksService.update(book.id, bookForm, 3)).rejects.toMatchObject({ type: 'CONFLIT', versionAttendue: 4 });
  expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/books/${book.id}`, expect.objectContaining({
    method: 'PUT', body: JSON.stringify(bookForm), headers: expect.objectContaining({ 'If-Match': '3' }),
  }));
});

test.each([true, false])('modifie séparément lu et favori à %s', async (value) => {
  reply({ ...book, lu: value });
  await expect(booksService.toggleLu(book.id, value)).resolves.toMatchObject({ lu: value });
  expect(fetch).toHaveBeenLastCalledWith(`${API_BASE_URL}/books/${book.id}`, expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ lu: value }) }));
  reply({ ...book, favori: value });
  await expect(booksService.toggleFavori(book.id, value)).resolves.toMatchObject({ favori: value });
  expect(fetch).toHaveBeenLastCalledWith(`${API_BASE_URL}/books/${book.id}`, expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ favori: value }) }));
});

test('supprime un livre', async () => {
  reply(null, 204);
  await expect(booksService.delete(book.id)).resolves.toBeNull();
  expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/books/${book.id}`, expect.objectContaining({ method: 'DELETE' }));
});

test('refuse une liste contenant un livre invalide', async () => {
  reply(page({ items: [{ ...book, note: 9 }] }));
  await expect(booksService.getAll()).rejects.toMatchObject({ type: 'RESEAU' });
});
