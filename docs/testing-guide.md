# ✅ Testing Guide

This guide provides a streamlined approach to testing the SaaS Starter Kit, helping you understand how tests are structured and how to add your own tests as you extend the application.

## Testing Architecture Overview

![Testing Architecture](./images/do-architecture-diagram.drawio.png)

The SaaS Starter Kit implements a comprehensive testing strategy:

- **Frontend Testing**: Components and UI functionality using React Testing Library
- **Backend Testing**: API routes and server-side logic using Jest and Supertest
- **Integration Testing**: End-to-end workflows across components

## Running Tests

### All Tests

To run all tests (both UI and server):

```bash
npm run test:all
```

### UI/Component Tests

To run only UI and component tests:

```bash
npm run test
```

### Server/API Tests

To run only server-side and API tests:

```bash
npm run test:server
```

### Running Specific Tests

To run tests matching a specific pattern:

```bash
npm run test -- -t "component name or test description"
```

### Watch Mode

To run tests in watch mode (tests will re-run when files change):

```bash
npm run test -- --watch
```

## Test File Organization

Tests are located alongside the code they test:

- Component tests use the naming pattern: `ComponentName.test.tsx`
- API route tests use the naming pattern: `route.test.ts`

Example structure:

```
src/
├── components/
│   └── Hello.tsx            # Component
│   └── Hello.test.tsx       # Component test
└── app/
    └── api/
        └── health/
            ├── route.ts     # API route
            └── route.test.ts # API route test
```

## Writing Tests

### Component Test Example

```typescript
import { render, screen } from '@testing-library/react';
import Hello from './Hello';

describe('Hello Component', () => {
  it('renders the hello message', () => {
    render(<Hello name="World" />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });
});
```

### API Route Test Example

```typescript
import { createRequest, createResponse } from 'node-mocks-http';
import { GET } from './route';

describe('Health API Route', () => {
  it('returns status ok', async () => {
    const req = createRequest();
    const res = createResponse();
    
    await GET(req, res);
    
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ status: 'ok' });
  });
});
```

## Testing Best Practices

1. **Test Component Behavior, Not Implementation**
   - Focus on what the component does, not how it works internally

2. **Use User-Centric Queries**
   - Prefer methods like `getByRole`, `getByLabelText`, and `getByText` over `getByTestId`

3. **Mock External Dependencies**
   - Use Jest's mocking capabilities to isolate the code being tested

4. **Snapshot Testing**
   - Use sparingly for UI components that rarely change

5. **Setup and Teardown**
   - Use `beforeEach`, `afterEach`, `beforeAll`, and `afterAll` for shared setup/cleanup

## Testing Authentication

For components or routes that require authentication:

```typescript
// Mock the useSession hook
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: '123', name: 'Test User', email: 'test@example.com' },
      expires: new Date().toISOString(),
    },
    status: 'authenticated',
  }),
}));
```

## Testing Database Operations

When testing code that interacts with the database:

1. **Mock Prisma Client**:
   ```typescript
   jest.mock('../../lib/prisma', () => ({
     prisma: {
       user: {
         findUnique: jest.fn().mockResolvedValue({
           id: '123',
           name: 'Test User',
           email: 'test@example.com',
         }),
       },
     },
   }));
   ```

2. **Alternatively, use a test database**:
   - Configure a separate test database in your Jest setup
   - Clear data between tests to ensure test isolation

## Testing File Uploads

When testing file uploads and storage operations:

```typescript
jest.mock('../../services/storage/spacesStorageService', () => ({
  uploadFile: jest.fn().mockResolvedValue({
    url: 'https://test-bucket.nyc3.digitaloceanspaces.com/test-file.jpg',
  }),
}));
```

## Coverage Reports

To generate a test coverage report:

```bash
npm run test -- --coverage
```

This will generate a coverage report in the `coverage/` directory.

## Continuous Integration

Tests run automatically in GitHub Actions workflows when you push or create a pull request. The workflow configuration can be found in the repository's `.github/workflows` directory.

## Troubleshooting Tests

When encountering issues with tests, use these solutions:

### Common Jest Issues

1. **Tests failing unexpectedly**:
   - Check for timing issues with async tests
   - Use `--detectOpenHandles` to find unresolved promises
   ```bash
   npm test -- --detectOpenHandles
   ```

2. **Environment variables in tests**:
   - Jest loads `.env.test` if available
   - Ensure environment variables are properly mocked

### React Testing Library Problems

1. **Component not rendering**:
   - Check for missing providers (Context, Theme)
   - Verify your test wrapper includes all required providers

2. **Element not found errors**:
   ```
   TestingLibraryElementError: Unable to find an element with...
   ```
   - Use `screen.debug()` to view the rendered DOM
   - Check for async rendering issues (use `await waitFor()`)
   - Ensure you're using the correct query method

### API Testing Issues

1. **Request timeouts**:
   - Check network connectivity in test environment
   - Increase timeout for slow tests:
   ```jest
   jest.setTimeout(10000); // increase to 10 seconds
   ```

2. **Database test failures**:
   - Ensure test database is properly set up
   - Use transactions to roll back test data
   - Reset the database between test runs

### CI Pipeline Test Failures

1. **Tests pass locally but fail in CI**:
   - Check for environment differences
   - Verify secrets and environment variables in CI
   - Look for timing or race condition issues

2. **Random test failures**:
   - Add retries for flaky tests
   - Isolate tests that may be affecting each other
   - Increase timeouts for network or database operations
