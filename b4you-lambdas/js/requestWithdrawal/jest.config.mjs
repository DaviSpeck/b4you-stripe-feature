export default {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {},
  testMatch: ['**/__tests__/**/*.test.mjs', '**/?(*.)+(spec|test).mjs'],
  collectCoverageFrom: [
    'useCases/**/*.mjs',
    'services/**/*.mjs',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  verbose: true,
};
