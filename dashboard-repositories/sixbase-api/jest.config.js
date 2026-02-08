module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['<rootDir>/**/*js'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/tmp/',
    '/tests/',
    '/reports/',
    '/database/',
    '/repositories/memory',
  ],
};
