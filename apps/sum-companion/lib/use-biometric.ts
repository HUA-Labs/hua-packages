/**
 * Biometric authentication hook
 *
 * Uses expo-local-authentication for Face ID / fingerprint.
 * Stores enabled preference in SecureStore.
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'sum_companion_biometric_enabled';

interface BiometricState {
  isAvailable: boolean;
  isEnabled: boolean;
  authenticate: () => Promise<boolean>;
  setEnabled: (enabled: boolean) => Promise<void>;
}

export function useBiometric(): BiometricState {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsAvailable(compatible && enrolled);

      try {
        const stored = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
        setIsEnabled(stored === 'true');
      } catch {
        // ignore
      }
    })();
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web' || !isAvailable) return true;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '본인 확인',
        fallbackLabel: '비밀번호 사용',
        cancelLabel: '취소',
      });
      return result.success;
    } catch {
      return false;
    }
  }, [isAvailable]);

  const setEnabledPersist = useCallback(async (enabled: boolean) => {
    setIsEnabled(enabled);
    if (Platform.OS === 'web') return;
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
  }, []);

  return { isAvailable, isEnabled, authenticate, setEnabled: setEnabledPersist };
}
