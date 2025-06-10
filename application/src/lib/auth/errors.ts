import { CredentialsSignin } from 'next-auth';

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

/**
 * Error thrown when provided credentials are invalid.
 */
export class InvalidCredentialsError extends CredentialsSignin {
  code = 'custom';
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}