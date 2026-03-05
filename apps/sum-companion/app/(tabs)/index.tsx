import { FlatList, RefreshControl } from 'react-native';
import { Box, Text, Pressable } from '@hua-labs/ui/native';
import { dot } from '@hua-labs/dot/native';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import type { DiaryEntry } from '../../lib/types';
import { useDiaries } from '../../lib/use-diaries';
import { useAuth } from '../../lib/AuthProvider';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

function DiaryCard({ entry, onPress }: { entry: DiaryEntry; onPress: () => void }) {
  return (
    <Pressable
      dot="mx-4 mb-3 p-4 rounded-xl bg-white"
      style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
      onPress={onPress}
    >
      <Box dot="flex-row items-center justify-between mb-2">
        <Text dot="text-sm text-gray-500">{formatDate(entry.diaryDate)}</Text>
        <Box dot="flex-row items-center gap-2">
          {entry.is_delayed_entry && (
            <Box dot="px-2 py-0.5 rounded-full bg-amber-100">
              <Text dot="text-xs text-amber-700">나중일기</Text>
            </Box>
          )}
          {entry.analysisResult?.hasAnalysis && (
            <Box dot="px-2 py-0.5 rounded-full bg-cyan-100">
              <Text dot="text-xs text-cyan-700">분석완료</Text>
            </Box>
          )}
        </Box>
      </Box>

      <Text dot="text-base font-semibold text-gray-900 mb-1">
        {entry.title ?? '무제'}
      </Text>

      {entry.analysisResult?.reflection_question && (
        <Text dot="text-sm text-gray-400" numberOfLines={1}>
          {entry.analysisResult.reflection_question}
        </Text>
      )}
    </Pressable>
  );
}

function ConnectPrompt() {
  const router = useRouter();
  return (
    <Box dot="flex-1 items-center justify-center p-8">
      <Text dot="text-4xl mb-4">🔗</Text>
      <Text dot="text-lg font-semibold text-gray-700 mb-2">서버 연결이 필요해요</Text>
      <Text dot="text-sm text-gray-400 text-center mb-4">
        설정에서 서버 URL과 토큰을 입력해주세요
      </Text>
      <Pressable
        dot="px-6 py-3 rounded-lg bg-cyan-500"
        onPress={() => router.push('/(tabs)/settings')}
      >
        <Text dot="text-white font-semibold">설정으로 이동</Text>
      </Pressable>
    </Box>
  );
}

function EmptyState() {
  return (
    <Box dot="flex-1 items-center justify-center p-8">
      <Text dot="text-4xl mb-4">📝</Text>
      <Text dot="text-lg font-semibold text-gray-700 mb-2">아직 일기가 없어요</Text>
      <Text dot="text-sm text-gray-400 text-center">
        my-app에서 첫 일기를 작성해보세요
      </Text>
    </Box>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Box dot="flex-1 items-center justify-center p-8">
      <Text dot="text-4xl mb-4">⚠️</Text>
      <Text dot="text-base text-gray-600 mb-4 text-center">{message}</Text>
      <Pressable dot="px-6 py-3 rounded-lg bg-cyan-500" onPress={onRetry}>
        <Text dot="text-white font-semibold">다시 시도</Text>
      </Pressable>
    </Box>
  );
}

export default function DiaryListScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { diaries, loading, error, refetch } = useDiaries();
  const router = useRouter();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Auth loading
  if (authLoading) {
    return (
      <Box dot="flex-1 items-center justify-center bg-gray-50">
        <Text dot="text-gray-400">로딩 중...</Text>
      </Box>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <ConnectPrompt />;
  }

  // Error state
  if (error && diaries.length === 0) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <FlatList
      style={dot('flex-1 bg-gray-50')}
      contentContainerStyle={diaries.length === 0 ? dot('flex-1') : dot('pt-4 pb-8')}
      data={diaries}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <DiaryCard
          entry={item}
          onPress={() => router.push({ pathname: '/diary/[id]', params: { id: item.id } })}
        />
      )}
      ListEmptyComponent={loading ? null : EmptyState}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          tintColor="#06b6d4"
          colors={['#06b6d4']}
        />
      }
    />
  );
}
