import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState } from 'react-native';
import { AuthProvider, useAuth } from '../lib/AuthProvider';
import { useBiometric } from '../lib/use-biometric';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isEnabled, authenticate } = useBiometric();
  const router = useRouter();
  const segments = useSegments();
  const appState = useRef(AppState.currentState);
  const needsBiometric = useRef(false);

  // Auth redirect
  useEffect(() => {
    if (isLoading) return;

    const inLoginPage = segments[0] === ('login' as string);

    if (!isAuthenticated && !inLoginPage) {
      router.replace('/login' as never);
    } else if (isAuthenticated && inLoginPage) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  // Biometric on foreground
  useEffect(() => {
    if (!isEnabled) return;

    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (needsBiometric.current) {
          const success = await authenticate();
          if (!success) {
            // Keep locked — user must retry
            needsBiometric.current = true;
          } else {
            needsBiometric.current = false;
          }
        }
      }

      if (nextAppState.match(/inactive|background/)) {
        needsBiometric.current = true;
      }

      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isEnabled, authenticate]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#06b6d4' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen
            name="diary/[id]"
            options={{
              title: '일기',
              headerBackTitle: '목록',
            }}
          />
        </Stack>
      </AuthGate>
      <StatusBar style="light" />
    </AuthProvider>
  );
}
