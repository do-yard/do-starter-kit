import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  testEnvironment: 'node',
  testMatch: ['**/app/api/**/*.test.ts', '**/lib/**/*.test.ts', '**/services/**/*.test.ts'],
  moduleNameMapper: {
    '^lib/(.*)$': '<rootDir>/src/lib/auth/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
  },
});
