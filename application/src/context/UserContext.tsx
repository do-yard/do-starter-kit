'use client';
import React, { createContext, useState } from 'react';

interface UserState {
  user: string | null;
  setUser: (user: string | null) => void;
}

export const UserContext = createContext<UserState | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
