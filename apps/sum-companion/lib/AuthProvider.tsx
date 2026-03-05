/**
 * Auth Context for sum-companion
 *
 * WebBrowser OAuth flow: opens my-app login in browser,
 * receives Bearer JWT via deep link callback.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';
import { apiFetch, getToken, setToken, clearToken, getServerUrl, setServerUrl, setOnUnauthorized } from './api';
import type { UserInfo } from './types';

// Ensure browser auth session completes properly
WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  loginWithBrowser: (serverUrl?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);

  const verifyToken = useCallback(async (): Promise<boolean> => {
    const { data, error } = await apiFetch<{ success: boolean; user: UserInfo }>(
      '/api/auth/mobile-token/verify'
    );
    if (error || !data?.success) {
      return false;
    }
    setUser(data.user);
    return true;
  }, []);

  const checkAuth = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    const valid = await verifyToken();
    setIsAuthenticated(valid);
    if (!valid) {
      setUser(null);
      await clearToken();
    }
    setIsLoading(false);
  }, [verifyToken]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loginWithBrowser = useCallback(async (serverUrl?: string) => {
    if (serverUrl) {
      await setServerUrl(serverUrl);
    }

    const baseUrl = await getServerUrl();
    const loginUrl = `${baseUrl}/auth/mobile-login`;
    const redirectUrl = 'sum-companion://auth';

    if (Platform.OS === 'web') {
      return { success: false, error: 'Browser login is only available on mobile devices.' };
    }

    try {
      const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const token = url.searchParams.get('token');

        if (token) {
          await setToken(token);
          const valid = await verifyToken();
          if (valid) {
            setIsAuthenticated(true);
            return { success: true };
          }
          await clearToken();
          return { success: false, error: 'Token verification failed.' };
        }
        return { success: false, error: 'No token received.' };
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return { success: false, error: 'Login cancelled.' };
      }

      return { success: false, error: 'Login failed.' };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Login failed.',
      };
    }
  }, [verifyToken]);

  const logout = useCallback(async () => {
    await clearToken();
    setIsAuthenticated(false);
    setUser(null);
    // Reset 401 guard so next session can trigger it again
    setOnUnauthorized(null);
  }, []);

  // Register 401 auto-logout: fires once per session, shows alert
  useEffect(() => {
    setOnUnauthorized(() => {
      Alert.alert('세션 만료', '다시 로그인해주세요.', [{ text: '확인' }]);
      logout();
    });
    return () => setOnUnauthorized(null);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, loginWithBrowser, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
