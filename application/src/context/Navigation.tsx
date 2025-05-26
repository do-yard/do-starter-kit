'use client';

import { createContext, useState } from 'react';

export const NavigatingContext = createContext<{
  navigating: boolean;
  setNavigating: (value: boolean) => void;
}>({ navigating: false, setNavigating: () => {} });

export const NavigatingProvider = ({ children }: { children: React.ReactNode }) => {
  const [navigating, setNavigating] = useState(false);

  return (
    <NavigatingContext.Provider value={{ navigating, setNavigating }}>
      {children}
    </NavigatingContext.Provider>
  );
};
