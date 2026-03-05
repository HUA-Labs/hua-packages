import { ScrollView, Switch, Alert } from 'react-native';
import { Box, Text, Pressable } from '@hua-labs/ui/native';
import { dot } from '@hua-labs/dot/native';
import { useAuth } from '../../lib/AuthProvider';
import { useBiometric } from '../../lib/use-biometric';

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box dot="mb-6">
      <Text dot="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-4">
        {title}
      </Text>
      <Box dot="bg-white rounded-xl mx-4 overflow-hidden">{children}</Box>
    </Box>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <Box dot="flex-row items-center justify-between px-4 py-3" style={{ borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb' }}>
      <Text dot="text-base text-gray-900">{label}</Text>
      <Text dot="text-sm text-gray-400" numberOfLines={1} style={{ maxWidth: 180 }}>{value}</Text>
    </Box>
  );
}

function SettingsToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <Box dot="flex-row items-center justify-between px-4 py-3" style={{ borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb' }}>
      <Text dot="text-base text-gray-900">{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#d1d5db', true: '#06b6d4' }}
        thumbColor="#fff"
      />
    </Box>
  );
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { isAvailable, isEnabled, setEnabled } = useBiometric();

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    await setEnabled(enabled);
  };

  return (
    <ScrollView style={dot('flex-1 bg-gray-50')}>
      <Box dot="pt-6 pb-8">
        <SettingsSection title="앱 정보">
          <SettingsRow label="버전" value="0.3.0" />
          <SettingsRow label="빌드" value="Phase 3 (OAuth)" />
        </SettingsSection>

        <SettingsSection title="계정">
          <SettingsRow label="상태" value="연결됨" />
          <SettingsRow label="사용자" value={user?.name || user?.identifier || '알 수 없음'} />
          {user?.identifier && (
            <SettingsRow label="식별자" value={user.identifier} />
          )}
        </SettingsSection>

        {isAvailable && (
          <SettingsSection title="보안">
            <SettingsToggleRow
              label="생체 인증"
              value={isEnabled}
              onToggle={handleBiometricToggle}
            />
            <Box dot="px-4 py-2">
              <Text dot="text-xs text-gray-400">
                앱을 열 때 Face ID / 지문으로 본인 확인을 합니다.
              </Text>
            </Box>
          </SettingsSection>
        )}

        <Box dot="mx-4 mt-2">
          <Pressable
            dot="py-3 rounded-lg items-center"
            style={{ backgroundColor: '#fee2e2' }}
            onPress={handleLogout}
          >
            <Text dot="font-semibold" style={{ color: '#dc2626' }}>로그아웃</Text>
          </Pressable>
        </Box>
      </Box>
    </ScrollView>
  );
}
