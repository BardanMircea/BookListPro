import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { coverUploadService } from '@/app/services/coverUploadService';
import { API_BASE_URL } from '@/constants/constants';
import { book, reply } from '../helpers/api';

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-image-manipulator', () => ({ manipulateAsync: jest.fn(), SaveFormat: { JPEG: 'jpeg' } }));

beforeEach(() => {
  jest.mocked(ImagePicker.launchImageLibraryAsync).mockReset();
  jest.mocked(ImageManipulator.manipulateAsync).mockReset();
});

function selectImage() {
  jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
    canceled: false, assets: [{ uri: 'file:///photo.png', width: 1200, height: 1800 }],
  });
}

test('ne compresse ni ne téléverse une sélection annulée', async () => {
  jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: true, assets: null });
  await expect(coverUploadService.pickAndUploadCover(book.id)).resolves.toBeNull();
  expect(ImageManipulator.manipulateAsync).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});

test('redimensionne en JPEG puis envoie le base64 au bon livre', async () => {
  selectImage();
  jest.mocked(ImageManipulator.manipulateAsync).mockResolvedValueOnce({ uri: 'file:///small.jpg', width: 600, height: 900, base64: 'aW1hZ2U=' });
  reply({ ...book, couverture: '/covers/dune.jpg' });
  await expect(coverUploadService.pickAndUploadCover(book.id)).resolves.toMatchObject({ couverture: '/covers/dune.jpg' });
  expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith('file:///photo.png', [{ resize: { width: 600 } }], { compress: 0.7, format: 'jpeg', base64: true });
  expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/books/${book.id}/cover`, expect.objectContaining({
    method: 'POST', body: JSON.stringify({ image: 'data:image/jpeg;base64,aW1hZ2U=' }),
  }));
});

test('refuse un encodage sans base64 avant tout envoi', async () => {
  selectImage();
  jest.mocked(ImageManipulator.manipulateAsync).mockResolvedValueOnce({ uri: 'file:///small.jpg', width: 600, height: 900 });
  await expect(coverUploadService.pickAndUploadCover(book.id)).rejects.toMatchObject({ type: 'RESEAU' });
  expect(fetch).not.toHaveBeenCalled();
});

test('réinitialise la couverture et retourne le livre actualisé', async () => {
  reply(book);
  await expect(coverUploadService.resetCover(book.id)).resolves.toEqual(book);
  expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/books/${book.id}/cover`, expect.objectContaining({ method: 'DELETE' }));
});
