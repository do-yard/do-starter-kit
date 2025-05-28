import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hashea una contraseña usando bcrypt.
 *
 * @param password - Contraseña en texto plano.
 * @returns Contraseña hasheada.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verifica una contraseña comparándola con un hash.
 *
 * @param plainPassword - Contraseña sin encriptar.
 * @param hashedPassword - Contraseña encriptada previamente.
 * @returns `true` si coinciden, `false` en caso contrario.
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
