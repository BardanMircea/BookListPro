import { z } from 'zod';
import { request } from '@/app/services/api/httpClient';
import { API_BASE_URL } from '@/constants/constants';
import { reply } from '../helpers/api';

const schema = z.object({ titre: z.string() });

test('valide la réponse et transmet les en-têtes, y compris la version zéro', async () => {
  reply({ titre: 'Dune', extra: 'ignoré' });
  await expect(request('/books/1', schema, { version: 0, headers: { Authorization: 'Bearer test' } }))
    .resolves.toEqual({ titre: 'Dune' });
  expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/books/1`, expect.objectContaining({
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test', 'If-Match': '0' },
    signal: expect.any(AbortSignal),
  }));
});

test('accepte 204 sans essayer de lire du JSON', async () => {
  const json = reply(null, 204);
  await expect(request('/books/1', z.null(), { method: 'DELETE' })).resolves.toBeNull();
  expect(json).not.toHaveBeenCalled();
});

test.each([
  [422, { message: 'Titre requis', champs: { titre: 'Requis' } }, { type: 'VALIDATION', message: 'Titre requis', champs: { titre: 'Requis' } }],
  [409, { message: 'Version obsolète', versionAttendue: 4 }, { type: 'CONFLIT', message: 'Version obsolète', versionAttendue: 4 }],
  [401, { message: 'Connexion requise' }, { type: 'AUTH', message: 'Connexion requise' }],
  [403, { message: 'Interdit' }, { type: 'AUTH', message: 'Interdit' }],
  [503, { message: 'Indisponible' }, { type: 'RESEAU', message: 'Indisponible' }],
])('traduit HTTP %i en erreur applicative', async (status, payload, expected) => {
  reply(payload, status);
  await expect(request('/books', schema)).rejects.toEqual(expected);
});

test('fournit un message de repli si le serveur renvoie du HTML', async () => {
  reply(null, 500).mockRejectedValue(new SyntaxError('HTML'));
  await expect(request('/books', schema)).rejects.toEqual({ type: 'RESEAU', message: 'Erreur serveur (500)' });
});

test('rejette une réponse incompatible avec le contrat Zod', async () => {
  reply({ titre: 42 });
  await expect(request('/books', schema)).rejects.toMatchObject({ type: 'RESEAU' });
});

test('traduit une panne réseau et nettoie le timeout', async () => {
  jest.useFakeTimers();
  jest.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));
  await expect(request('/books', schema)).rejects.toEqual({ type: 'RESEAU', message: 'Impossible de joindre le serveur.' });
  expect(jest.getTimerCount()).toBe(0);
});

test('annule une requête trop lente et renvoie une erreur de timeout', async () => {
  jest.useFakeTimers();
  jest.mocked(fetch).mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => {
    options?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('Aborted'), { name: 'AbortError' })));
  }));
  const assertion = expect(request('/books', schema, { timeoutMs: 100 })).rejects.toMatchObject({
    type: 'RESEAU', message: expect.stringContaining('timeout'),
  });
  await jest.advanceTimersByTimeAsync(100);
  await assertion;
  expect(jest.getTimerCount()).toBe(0);
});
