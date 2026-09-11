import { fireEvent, render, screen } from '@testing-library/react-native';
import { ErrorView } from '@/components/ErrorView';
import type { AppError } from '@/app/domain/errors';

test.each<[AppError['type'], string]>([
  ['RESEAU', 'Problème réseau'], ['CONFLIT', 'Conflit de version'],
  ['VALIDATION', 'Données invalides'], ['AUTH', 'Accès refusé'],
])('explique une erreur %s et permet de réessayer', (type, prefix) => {
  const onRetry = jest.fn();
  render(<ErrorView error={{ type, message: 'Détail' }} onRetry={onRetry} />);
  expect(screen.getByText(`${prefix} : Détail`)).toBeOnTheScreen();
  fireEvent.press(screen.getByText('Réessayer'));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test('affiche un message générique sans erreur détaillée', () => {
  render(<ErrorView error={null} onRetry={jest.fn()} />);
  expect(screen.getByText('Une erreur inattendue est survenue.')).toBeOnTheScreen();
});
