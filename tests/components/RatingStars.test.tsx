import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { RatingStars } from '@/components/RatingStars';
import { ThemeProvider } from '@/app/theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function renderStars(note: number | null, onRate: (value: number) => void, readOnly = false) {
  render(<ThemeProvider><RatingStars note={note} onRate={onRate} readOnly={readOnly} /></ThemeProvider>);
  await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());
}

test('permet de noter un livre sans note', async () => {
  const onRate = jest.fn();
  await renderStars(null, onRate);
  expect(screen.getAllByRole('button', { selected: false })).toHaveLength(5);
  fireEvent.press(screen.getByRole('button', { name: 'Donner la note de 4 sur 5' }));
  expect(onRate).toHaveBeenCalledWith(4);
});

test('réinitialise à zéro lorsque la même note est sélectionnée', async () => {
  const onRate = jest.fn();
  await renderStars(3, onRate);
  expect(screen.getAllByRole('button', { selected: true })).toHaveLength(3);
  fireEvent.press(screen.getByRole('button', { name: 'Donner la note de 3 sur 5' }));
  expect(onRate).toHaveBeenCalledWith(0);
});

test('interdit toute modification en lecture seule', async () => {
  const onRate = jest.fn();
  await renderStars(2, onRate, true);
  const star = screen.getByRole('button', { name: 'Donner la note de 5 sur 5' });
  expect(star).toBeDisabled();
  fireEvent.press(star);
  expect(onRate).not.toHaveBeenCalled();
});
