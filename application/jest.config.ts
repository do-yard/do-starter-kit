import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '@testing-library/jest-dom'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^components/(.*)$': '/src/components/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/src/lib/',
    '<rootDir>/src/services/',
    '<rootDir>/src/app/api/',
    '<rootDir>/src/helpers/',
    '/node_modules/',
  ],
};

export default createJestConfig(customJestConfig);
