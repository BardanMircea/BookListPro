import { fetchOpenLibraryData } from '@/app/services/api/openLibraryService';
import { OPEN_LIBRARY } from '@/constants/constants';
import { reply } from '../helpers/api';

const fallback = { trouve: false, nombreEditions: 0 };

test.each(['', '   '])('ne fait aucune requête pour un titre vide', async (title) => {
  await expect(fetchOpenLibraryData(title)).resolves.toEqual(fallback);
  expect(fetch).not.toHaveBeenCalled();
});

test('encode le titre et transforme les métadonnées et la couverture', async () => {
  reply({ numFound: 1, docs: [{ title: 'Été & mer', edition_count: 8, first_publish_year: 1965, cover_i: 123 }] });
  await expect(fetchOpenLibraryData(' Été & mer ')).resolves.toEqual({ trouve: true, nombreEditions: 8, premiereAnneePublication: 1965, couvertureSecoursUrl: `${OPEN_LIBRARY.coversUrl}/123-M.jpg` });
  expect(fetch).toHaveBeenCalledWith(`${OPEN_LIBRARY.searchUrl}?title=${encodeURIComponent('Été & mer')}&limit=1`, expect.anything());
});

test('accepte les métadonnées optionnelles absentes', async () => {
  reply({ numFound: 1, docs: [{}] });
  await expect(fetchOpenLibraryData('Dune')).resolves.toEqual({ trouve: true, nombreEditions: 0 });
});

test.each([
  [200, { numFound: 0, docs: [] }],
  [200, { docs: 'invalide' }],
  [503, { message: 'Indisponible' }],
])('se replie pour HTTP %s et %j', async (status, payload) => {
  reply(payload, status);
  await expect(fetchOpenLibraryData('Dune')).resolves.toEqual(fallback);
});

test('se replie lors d’une panne réseau', async () => {
  jest.mocked(fetch).mockRejectedValueOnce(new TypeError('offline'));
  await expect(fetchOpenLibraryData('Dune')).resolves.toEqual(fallback);
});
