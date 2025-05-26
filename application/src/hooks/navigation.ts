'use client';

import { useRouter } from 'next/navigation';

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
