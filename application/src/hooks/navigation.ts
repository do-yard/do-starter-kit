'use client';

import { NavigatingContext } from 'context/Navigation';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';

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

export const useNavigating = () => useContext(NavigatingContext);
