'use client';
import React, { createContext, useState } from 'react';

interface UserState {
  user: string | null;
  setUser: (user: string | null) => void;
}

/**
 * Contexto global de usuario.
 * Permite guardar información de usuario personalizada fuera de Auth.js.
 */
export const UserContext = createContext<UserState | undefined>(undefined);

/**
 * Proveedor de contexto de usuario.
 * Expone el nombre del usuario y una función para actualizarlo.
 *
 * @param children - Componentes envueltos que acceden al contexto.
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
