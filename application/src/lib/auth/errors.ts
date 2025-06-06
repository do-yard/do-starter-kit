/**
 * Error thrown when email and password are not provided.
 */
export class MissingCredentialsError extends Error {
  name = 'CredentialsSignin';
  code = 'Email and password are required';
}

/**
 * Error thrown when attempting to register a user that already exists.
 */
export class UserAlreadyExistsError extends Error {
  name = 'CredentialsSignin';
  code = 'User already exists';
}

/**
 * Error thrown when provided credentials are invalid.
 */
export class InvalidCredentialsError extends Error {
  name = 'CredentialsSignin';
  code = 'Invalid credentials';
}
