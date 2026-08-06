import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { tokenStorage } from '../utils/tokenStorage';
import { isTokenExpired } from '../utils/jwt';
import type { AdminUser, LoginRequest } from '../types/auth.types';

interface AuthContextValue {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getInitialAdmin(): AdminUser | null {
  const token = tokenStorage.getAccessToken();
  if (!token || isTokenExpired(token)) {
    tokenStorage.clear();
    return null;
  }
  return tokenStorage.getAdmin();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(getInitialAdmin);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (payload: LoginRequest) => {
    setIsLoading(true);
    try {
      // authService.login() already fully unwraps the double envelope down
      // to { access_token, refresh_token, user } — see admin.service.ts's
      // validateLogin(), which is the only place "user" (a bare username
      // string, not an object) comes from.
      const result = await authService.login(payload);
      tokenStorage.setTokens(result.access_token, result.refresh_token);
      const adminData: AdminUser = { username: result.user };
      tokenStorage.setAdmin(adminData);
      setAdmin(adminData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setAdmin(null);
    window.location.href = '/login';
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ admin, isAuthenticated: !!admin, isLoading, login, logout }),
    [admin, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
