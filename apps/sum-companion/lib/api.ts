/**
 * API Client for sum-companion
 *
 * Bearer token auto-attach, SecureStore-based token management.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'sum_companion_token';
const SERVER_URL_KEY = 'sum_companion_server_url';
const DEFAULT_SERVER_URL = 'https://sumdiary.com';

// In-memory cache for fast access
let cachedToken: string | null = null;
let cachedServerUrl: string | null = null;

// --- 401 Auto-Logout ---
// AuthProvider registers a callback; apiFetch fires it on 401 (once).
let onUnauthorized: (() => void) | null = null;
let unauthorizedFired = false;

export function setOnUnauthorized(callback: (() => void) | null): void {
  onUnauthorized = callback;
  unauthorizedFired = false;
}

function fireUnauthorized(): void {
  if (unauthorizedFired || !onUnauthorized) return;
  unauthorizedFired = true;
  onUnauthorized();
}

// --- Token Management ---

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  // SecureStore is not available on web
  if (Platform.OS === 'web') return null;
  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
    return cachedToken;
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  cachedToken = token;
  if (Platform.OS === 'web') return;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  cachedToken = null;
  if (Platform.OS === 'web') return;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// --- Server URL Management ---

export async function getServerUrl(): Promise<string> {
  if (cachedServerUrl) return cachedServerUrl;
  if (Platform.OS === 'web') return DEFAULT_SERVER_URL;
  try {
    const url = await SecureStore.getItemAsync(SERVER_URL_KEY);
    cachedServerUrl = url || DEFAULT_SERVER_URL;
    return cachedServerUrl;
  } catch {
    return DEFAULT_SERVER_URL;
  }
}

export async function setServerUrl(url: string): Promise<void> {
  // Normalize: remove trailing slash
  const normalized = url.replace(/\/+$/, '');
  cachedServerUrl = normalized;
  if (Platform.OS === 'web') return;
  await SecureStore.setItemAsync(SERVER_URL_KEY, normalized);
}

// --- API Fetch ---

interface FetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const token = await getToken();
  const serverUrl = await getServerUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${serverUrl}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        fireUnauthorized();
      }
      return {
        data: null,
        error: data.message || data.error || `Error ${response.status}`,
        status: response.status,
      };
    }

    return { data, error: null, status: response.status };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
      status: 0,
    };
  }
}
