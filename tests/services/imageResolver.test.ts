import { resolveCoverUrl } from '@/app/services/imageResolver';
import { API_BASE_URL, DEFAULT_BOOK_COVER } from '@/constants/constants';

test.each([null, undefined, '', '   '])('utilise le repli pour %s', (value) => {
  expect(resolveCoverUrl(value)).toBe(DEFAULT_BOOK_COVER);
});
test.each(['http://example.com/cover.jpg', 'https://example.com/cover.jpg'])('conserve une URL absolue : %s', (value) => {
  expect(resolveCoverUrl(` ${value} `)).toBe(value);
});
test.each(['/covers/dune.jpg', 'covers/dune.jpg', ' covers/dune.jpg '])('normalise un chemin relatif : %s', (value) => {
  expect(resolveCoverUrl(value)).toBe(`${API_BASE_URL}/covers/dune.jpg`);
});
