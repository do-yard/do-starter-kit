'use client';

import { createContext, useState } from 'react';

/**
 * Contexto global para manejar el estado de navegación (`navigating`).
 * Permite mostrar loaders durante transiciones o requests controladas.
 */
export const NavigatingContext = createContext<{
  navigating: boolean;
  setNavigating: (value: boolean) => void;
}>({ navigating: false, setNavigating: () => {} });

/**
 * Proveedor de contexto de navegación.
 * Provee el estado `navigating` y la función `setNavigating` a toda la app.
 *
 * @param children - Componentes hijos que podrán acceder al contexto.
 */
export const NavigatingProvider = ({ children }: { children: React.ReactNode }) => {
  const [navigating, setNavigating] = useState(false);

  return (
    <NavigatingContext.Provider value={{ navigating, setNavigating }}>
      {children}
    </NavigatingContext.Provider>
  );
};
