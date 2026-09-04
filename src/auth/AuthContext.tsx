import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { apiRequest, clearSession, readStoredUser, storeSession, storeUser } from '../api/api-client';
import { AuthenticatedUser, AuthResponse } from '../types/api';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  loginWithGoogle(idToken: string, birthDate?: string): Promise<void>;
  register(name: string, email: string, password: string, birthDate: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  updateCurrentUser(user: AuthenticatedUser): Promise<void>;
  logout(): Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([readStoredUser(), new Promise(resolve => setTimeout(resolve, 1800))])
      .then(([storedUser]) => setUser(storedUser))
      .finally(() => setLoading(false));
  }, []);
  const value = useMemo(() => ({
    user, loading,
    async login(email: string, password: string) {
      const session = await apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false);
      await storeSession(session); setUser(session.user);
    },
    async loginWithGoogle(idToken: string, birthDate?: string) {
      const session = await apiRequest<AuthResponse>('/auth/google', {
        method: 'POST', body: JSON.stringify({ idToken, birthDate })
      }, false);
      await storeSession(session); setUser(session.user);
    },
    async register(name: string, email: string, password: string, birthDate: string) {
      const session = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST', body: JSON.stringify({ name, email, password, birthDate })
      }, false);
      await storeSession(session); setUser(session.user);
    },
    async requestPasswordReset(email: string) {
      await apiRequest('/auth/password-reset/request', { method: 'POST', body: JSON.stringify({ email }) }, false);
    },
    async resetPassword(token: string, password: string) {
      await apiRequest('/auth/password-reset/confirm', { method: 'POST', body: JSON.stringify({ token, password }) }, false);
    },
    async updateCurrentUser(updatedUser: AuthenticatedUser) { await storeUser(updatedUser); setUser(updatedUser); },
    async logout() { await clearSession(); setUser(null); }
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
