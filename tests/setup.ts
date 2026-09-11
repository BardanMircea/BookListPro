jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Aucun appel HTTP réel, même si un test oublie de préparer sa réponse.
beforeEach(() => {
  jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Appel fetch non simulé'));
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});
