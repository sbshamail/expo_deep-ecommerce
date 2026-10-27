import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchCurrentUser, login, refreshTokens } from '@/api/auth';
import { ApiError } from '@/api/client';
import { STORAGE_KEYS } from '@/constants/config';
import { storage } from '@/lib/storage';
import { AuthUser, SigninPayload } from '@/types/auth_types';

import { getPermissions, hasPermission, hasShopPermission, isShopAdmin } from './permissions';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** True until the stored session has been checked on app start. */
  isLoading: boolean;
  signIn: (payload: SigninPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  can: (...permissions: string[]) => boolean;
  canInShop: (shopId: number | null | undefined, ...permissions: string[]) => boolean;
  isShopAdmin: (shopId?: number | null) => boolean;
  permissions: Set<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(async () => {
    await Promise.all([
      storage.remove(STORAGE_KEYS.accessToken),
      storage.remove(STORAGE_KEYS.refreshToken),
    ]);
    setToken(null);
    setUser(null);
  }, []);

  // Restore the session from secure storage on app start.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await storage.get(STORAGE_KEYS.accessToken);
      if (stored) {
        try {
          let active = stored;
          let me;
          try {
            me = await fetchCurrentUser(active);
          } catch (e) {
            // Access token expired → trade the refresh token for a new pair once.
            const refreshToken = await storage.get(STORAGE_KEYS.refreshToken);
            if (!(e instanceof ApiError && e.status === 401) || !refreshToken) throw e;
            const fresh = await refreshTokens(refreshToken);
            active = fresh.access_token;
            await storage.set(STORAGE_KEYS.accessToken, active);
            if (fresh.refresh_token) await storage.set(STORAGE_KEYS.refreshToken, fresh.refresh_token);
            me = await fetchCurrentUser(active);
          }
          if (!cancelled) {
            setToken(active);
            setUser(me);
          }
        } catch (e) {
          // Only drop the session when the server rejected it — a network
          // failure on launch must not sign the user out.
          if (e instanceof ApiError && e.status !== 0) await clearSession();
        }
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const signIn = useCallback(async (payload: SigninPayload) => {
    const data = await login(payload);
    await storage.set(STORAGE_KEYS.accessToken, data.access_token);
    if (data.refresh_token) await storage.set(STORAGE_KEYS.refreshToken, data.refresh_token);
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      setUser(await fetchCurrentUser(token));
    } catch {
      await clearSession();
    }
  }, [token, clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: user !== null,
      isLoading,
      signIn,
      signOut: clearSession,
      refresh,
      can: (...p) => hasPermission(user, ...p),
      canInShop: (shopId, ...p) => hasShopPermission(user, shopId, ...p),
      isShopAdmin: (shopId) => isShopAdmin(user, shopId),
      permissions: getPermissions(user),
    }),
    [user, token, isLoading, signIn, clearSession, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
