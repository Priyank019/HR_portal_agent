import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthRole, AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@hr-portal/auth-contracts';
import { authApi } from '../lib/auth-api';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (input: LoginRequest) => Promise<AuthUser>;
  register: (input: RegisterRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  hasRole: (roles: AuthRole[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const applySession = (response: AuthResponse) => ({
  user: response.user,
  accessToken: response.tokens.accessToken,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const isAuthenticated = status === 'authenticated' && user !== null;

  const syncSession = useCallback((response: AuthResponse) => {
    const session = applySession(response);
    setUser(session.user);
    setAccessToken(session.accessToken);
    setStatus('authenticated');
    return session.user;
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setStatus('unauthenticated');
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const response = await authApi.refresh();
      syncSession(response);
      return true;
    } catch {
      clearSession();
      return false;
    }
  }, [clearSession, syncSession]);

  const login = useCallback(async (input: LoginRequest) => {
    const response = await authApi.login(input);
    return syncSession(response);
  }, [syncSession]);

  const register = useCallback(async (input: RegisterRequest) => {
    const response = await authApi.register(input);
    return syncSession(response);
  }, [syncSession]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const hasRole = useCallback(
    (roles: AuthRole[]) => Boolean(user && roles.includes(user.role)),
    [user],
  );

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const authenticated = await refreshSession();
      if (!active) {
        return;
      }

      if (!authenticated) {
        setStatus('unauthenticated');
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      status,
      isAuthenticated,
      login,
      register,
      logout,
      refreshSession,
      hasRole,
    }),
    [accessToken, hasRole, isAuthenticated, login, logout, refreshSession, register, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
