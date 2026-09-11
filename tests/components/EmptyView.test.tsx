import { fireEvent, render, screen } from '@testing-library/react-native';
import { EmptyView } from '@/components/EmptyView';

test('affiche le message par défaut', () => {
  render(<EmptyView />);
  expect(screen.getByText('Aucun ouvrage trouvé')).toBeOnTheScreen();
  expect(screen.getByText('Votre fonds de lecture ne contient pas encore de livre.')).toBeOnTheScreen();
});

test('affiche le message personnalisé et déclenche l’action', () => {
  const onAction = jest.fn();
  render(<EmptyView titre="Aucun favori" description="Ajoutez un favori." actionLabel="Ajouter" onAction={onAction} />);
  expect(screen.getByText('Aucun favori')).toBeOnTheScreen();
  expect(screen.getByText('Ajoutez un favori.')).toBeOnTheScreen();
  fireEvent.press(screen.getByText('Ajouter'));
  expect(onAction).toHaveBeenCalledTimes(1);
});

test('masque une action sans gestionnaire', () => {
  render(<EmptyView actionLabel="Ajouter" />);
  expect(screen.queryByText('Ajouter')).toBeNull();
});
