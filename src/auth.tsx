import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { User } from './types';
import { store } from './store';

interface AuthContextType { user: User | null; login: (u: string, p: string) => Promise<boolean>; logout: () => void; isLoading: boolean; error: string | null; }
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true); setError(null);
    try { const u = await store.authenticate(username, password); if (u) { setUser(u); return true; } setError('Invalid credentials'); return false; }
    catch { setError('Authentication failed'); return false; }
    finally { setIsLoading(false); }
  }, []);

  const logout = useCallback(() => { setUser(null); setError(null); }, []);
  return <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
