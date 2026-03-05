import { useState } from 'react';
import { TextInput, ActivityIndicator } from 'react-native';
import { Box, Text, Pressable } from '@hua-labs/ui/native';
import { dot } from '@hua-labs/dot/native';
import { useAuth } from '../lib/AuthProvider';

export default function LoginScreen() {
  const { loginWithBrowser } = useAuth();
  const [serverUrl, setServerUrl] = useState('https://sumdiary.com');
  const [showServerInput, setShowServerInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const result = await loginWithBrowser(serverUrl.trim());
    if (!result.success && result.error !== 'Login cancelled.') {
      setError(result.error || '로그인에 실패했습니다.');
    }
    setLoading(false);
  };

  return (
    <Box dot="flex-1 items-center justify-center p-6" style={{ backgroundColor: '#0f172a' }}>
      <Box dot="items-center mb-12">
        <Text dot="text-3xl font-bold mb-2" style={{ color: '#06b6d4' }}>
          sum
        </Text>
        <Text dot="text-sm" style={{ color: '#94a3b8' }}>
          companion
        </Text>
      </Box>

      <Box style={{ width: '100%', maxWidth: 320 }}>
        <Pressable
          dot="py-4 rounded-xl items-center mb-3"
          style={{ backgroundColor: '#06b6d4' }}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text dot="text-base font-semibold text-white">로그인</Text>
          )}
        </Pressable>

        {error && (
          <Text dot="text-xs text-center mb-3" style={{ color: '#f87171' }}>
            {error}
          </Text>
        )}

        {!showServerInput ? (
          <Pressable dot="items-center py-2" onPress={() => setShowServerInput(true)}>
            <Text dot="text-xs" style={{ color: '#475569' }}>서버 설정</Text>
          </Pressable>
        ) : (
          <Box dot="mt-2">
            <Text dot="text-xs mb-1" style={{ color: '#64748b' }}>서버 URL</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#334155',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 14,
                color: '#e2e8f0',
                backgroundColor: '#1e293b',
              }}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="https://sumdiary.com"
              placeholderTextColor="#475569"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </Box>
        )}
      </Box>

      <Text dot="text-xs mt-12" style={{ color: '#334155' }}>
        소셜 계정으로 안전하게 로그인합니다
      </Text>
    </Box>
  );
}
