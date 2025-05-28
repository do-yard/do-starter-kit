'use client';

import { NavigatingContext } from 'context/Navigation';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';

/**
 * Hook personalizado para navegar con prefetch en Next.js App Router.
 * Intenta precargar la ruta antes de hacer `router.push`.
 *
 * @returns Objeto con método `navigate(href)` para navegación con prefetch.
 */
export const usePrefetchRouter = () => {
  const router = useRouter();

  const navigate = async (href: string) => {
    try {
      await router.prefetch(href);
    } catch (err) {
      console.warn(`Prefetch failed for ${href}`, err);
    }
    router.push(href);
  };

  return { navigate };
};

/**
 * Hook para acceder al estado global de navegación (`navigating`).
 * Útil para mostrar o esconder spinners de carga.
 *
 * @returns Objeto `{ navigating, setNavigating }` desde el contexto.
 */
export const useNavigating = () => useContext(NavigatingContext);
