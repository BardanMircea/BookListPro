module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/**/*.test.[jt]s?(x)'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['app/domain/**/*.ts', 'app/services/**/*.ts'],
  coverageReporters: ['text', 'html', 'lcov'],
  coverageThreshold: {
    './app/domain/': { statements: 40, branches: 40, functions: 40, lines: 40 },
    './app/services/': { statements: 40, branches: 40, functions: 40, lines: 40 },
  },
};
