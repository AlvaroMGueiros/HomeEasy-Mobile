import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { apiRequest, clearSession, readStoredUser, storeSession } from '../api/api-client';
import { AuthenticatedUser, AuthResponse } from '../types/api';

interface AuthContextValue { user: AuthenticatedUser | null; loading: boolean; login(email: string, password: string): Promise<void>; logout(): Promise<void>; }
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { readStoredUser().then(setUser).finally(() => setLoading(false)); }, []);
  const value = useMemo(() => ({
    user, loading,
    async login(email: string, password: string) {
      const session = await apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false);
      await storeSession(session); setUser(session.user);
    },
    async logout() { await clearSession(); setUser(null); }
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
