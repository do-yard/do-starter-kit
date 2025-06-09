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

/**
 * Error thrown when email is not verified.
 */
export class EmailNotVerifiedError extends Error {
  name = 'CredentialsSignin';
  code = 'Email not verified';
}

/**
 * Error thrown when the current password is empty.
 */
export class EmptyCurrentPasswordError extends Error {
  name = 'UpdatePassword';
  code = 'Current password cannot be empty';
}

/**
 * Error thrown when the new password is empty.
 */
export class EmptyNewPasswordError extends Error {
  name = 'UpdatePassword';
  code = 'New password cannot be empty';
}

/**
 * Error thrown when the confirm new password is empty.
 */
export class EmptyConfirmNewPasswordError extends Error {
  name = 'UpdatePassword';
  code = 'Confirm new password cannot be empty';
}

/**
 * Error thrown when the new passwords do not match.
 */
export class NewPasswordsDoNotMatchError extends Error {
  name = 'UpdatePassword';
  code = 'New passwords do not match';
}

/**
 * Error thrown when the user does not exist.
 */
export class UserDoesNotExistError extends Error {
  name = 'UpdatePassword';
  code = "User doesn't exist";
}

/**
 * Error thrown when the current password is incorrect.
 */
export class IncorrectCurrentPasswordError extends Error {
  name = 'UpdatePassword';
  code = 'Current password is incorrect';
}
