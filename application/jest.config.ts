import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/src/lib/',
    '<rootDir>/src/services/',
    '<rootDir>/src/app/api/',
    '/node_modules/',
  ],
});
