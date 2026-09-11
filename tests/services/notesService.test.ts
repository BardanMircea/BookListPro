import { notesService } from '@/app/services/api/notesService';
import { API_BASE_URL } from '@/constants/constants';
import { book, note, reply } from '../helpers/api';

test('charge les notes du livre demandé', async () => {
  reply([note]);
  await expect(notesService.getByBookId(book.id)).resolves.toEqual([note]);
  expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/books/${book.id}/notes`, expect.anything());
});

test('envoie le contenu de la nouvelle note', async () => {
  reply(note, 201);
  await expect(notesService.create(book.id, { contenu: note.contenu })).resolves.toEqual(note);
  expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/books/${book.id}/notes`, expect.objectContaining({ method: 'POST', body: JSON.stringify({ contenu: note.contenu }) }));
});

test('supprime seulement la note ciblée', async () => {
  reply(null, 204);
  await expect(notesService.delete(book.id, note.id)).resolves.toBeNull();
  expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/books/${book.id}/notes/${note.id}`, expect.objectContaining({ method: 'DELETE' }));
});

test('refuse une note vide reçue du serveur', async () => {
  reply([{ ...note, contenu: '' }]);
  await expect(notesService.getByBookId(book.id)).rejects.toMatchObject({ type: 'RESEAU' });
});
