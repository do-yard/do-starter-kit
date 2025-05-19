import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  testEnvironment: 'node',
  testMatch: ['**/app/api/**/*.test.ts'],
});
