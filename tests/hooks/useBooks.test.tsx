import type { PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBooks } from '@/hooks/useBooks';
import { book, page, reply } from '../helpers/api';

let client: QueryClient;
beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
});
afterEach(() => client.clear());
function wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

test('passe du chargement aux livres validés par le service réel', async () => {
  reply(page());
  const { result } = renderHook(() => useBooks(), { wrapper });
  expect(result.current.isLoading).toBe(true);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.books).toEqual([book]);
  expect(result.current.pagination).toMatchObject({ currentPage: 1, totalItems: 1, hasNext: false, hasPrevious: false });
});

test('expose un résultat vide', async () => {
  reply(page({ items: [], total: 0, totalPages: 0 }));
  const { result } = renderHook(() => useBooks(), { wrapper });
  await waitFor(() => expect(result.current.isEmpty).toBe(true));
  expect(result.current.books).toEqual([]);
  expect(result.current.isError).toBe(false);
});

test('expose une erreur API et permet de relancer le chargement', async () => {
  reply({ message: 'Maintenance' }, 503);
  const { result } = renderHook(() => useBooks(), { wrapper });
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.error).toEqual({ type: 'RESEAU', message: 'Maintenance' });
  expect(result.current.isEmpty).toBe(false);
  reply(page());
  await act(async () => { await result.current.refetch(); });
  await waitFor(() => expect(result.current.books).toEqual([book]));
  expect(result.current.isError).toBe(false);
});

test('recharge lors d’un changement de filtre en conservant les autres filtres', async () => {
  reply(page());
  const { result } = renderHook(() => useBooks(), { wrapper });
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  reply(page({ items: [], total: 0, totalPages: 0 }));
  act(() => result.current.setFilters({ q: 'inexistant', favori: false }));
  await waitFor(() => expect(result.current.isEmpty).toBe(true));
  const url = new URL(String(jest.mocked(fetch).mock.calls[1][0]));
  expect(Object.fromEntries(url.searchParams)).toEqual({ page: '1', limit: '20', sort: 'titre', order: 'asc', q: 'inexistant', favori: 'false' });
});

test('navigue entre les pages sans dépasser les bornes', async () => {
  reply(page({ total: 21, totalPages: 2 }));
  const { result } = renderHook(() => useBooks(), { wrapper });
  await waitFor(() => expect(result.current.pagination.hasNext).toBe(true));
  act(() => result.current.pagination.previousPage());
  expect(result.current.filters.page).toBe(1);
  reply(page({ page: 2, total: 21, totalPages: 2 }));
  act(() => result.current.pagination.nextPage());
  await waitFor(() => expect(result.current.pagination.currentPage).toBe(2));
  expect(result.current.pagination.hasPrevious).toBe(true);
  expect(result.current.pagination.hasNext).toBe(false);
  act(() => result.current.pagination.nextPage());
  expect(result.current.filters.page).toBe(2);
  reply(page({ total: 21, totalPages: 2 }));
  act(() => result.current.pagination.previousPage());
  await waitFor(() => expect(result.current.pagination.currentPage).toBe(1));
  await waitFor(() => expect(result.current.isFetching).toBe(false));
});
