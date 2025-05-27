import { CredentialsSignin } from '@auth/core/errors';

export class MissingCredentialsError extends CredentialsSignin {
  code = 'Email and password are required';
}

export class UserAlreadyExistsError extends CredentialsSignin {
  code = 'User already exists';
}

export class InvalidCredentialsError extends CredentialsSignin {
  code = 'Invalid credentials';
}
