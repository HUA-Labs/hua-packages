import { ScrollView, ActivityIndicator } from 'react-native';
import { Box, Text } from '@hua-labs/ui/native';
import { dot } from '@hua-labs/dot/native';
import { useLocalSearchParams } from 'expo-router';
import { useDiaryDetail } from '../../lib/use-diaries';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box dot="mb-4">
      <Text dot="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{title}</Text>
      {children}
    </Box>
  );
}

export default function DiaryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { diary, analysis, loading, error } = useDiaryDetail(id ?? null);

  if (loading) {
    return (
      <Box dot="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#06b6d4" />
      </Box>
    );
  }

  if (error || !diary) {
    return (
      <Box dot="flex-1 items-center justify-center p-8 bg-gray-50">
        <Text dot="text-4xl mb-4">⚠️</Text>
        <Text dot="text-base text-gray-600 text-center">{error || '일기를 불러올 수 없습니다.'}</Text>
      </Box>
    );
  }

  return (
    <ScrollView style={dot('flex-1 bg-gray-50')}>
      <Box dot="p-4">
        {/* Header */}
        <Box dot="bg-white rounded-xl p-4 mb-4" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
          <Text dot="text-xl font-bold text-gray-900 mb-2">
            {diary.title ?? '무제'}
          </Text>
          <Box dot="flex-row items-center gap-3">
            <Text dot="text-sm text-gray-500">{formatDate(diary.diaryDate)}</Text>
            {diary.isDelayedEntry && (
              <Box dot="px-2 py-0.5 rounded-full bg-amber-100">
                <Text dot="text-xs text-amber-700">나중일기</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box dot="bg-white rounded-xl p-4 mb-4" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
          <Text dot="text-base text-gray-800" style={{ lineHeight: 24 }}>
            {diary.content}
          </Text>
        </Box>

        {/* Analysis */}
        {analysis && (
          <Box dot="bg-white rounded-xl p-4 mb-4" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
            <Text dot="text-sm font-semibold text-cyan-700 mb-3">분석 결과</Text>

            {analysis.summary ? (
              <Section title="요약">
                <Text dot="text-sm text-gray-700" style={{ lineHeight: 20 }}>
                  {analysis.summary}
                </Text>
              </Section>
            ) : null}

            {analysis.emotion_flow.length > 0 && (
              <Section title="감정 흐름">
                {analysis.emotion_flow.map((emotion, i) => (
                  <Box key={i} dot="flex-row items-center mb-1">
                    <Text dot="text-sm text-gray-500 mr-2">{i + 1}.</Text>
                    <Text dot="text-sm text-gray-700">{emotion}</Text>
                  </Box>
                ))}
              </Section>
            )}

            {analysis.reflection_question && (
              <Section title="성찰 질문">
                <Box dot="p-3 rounded-lg bg-cyan-50">
                  <Text dot="text-sm text-cyan-800" style={{ lineHeight: 20 }}>
                    {analysis.reflection_question}
                  </Text>
                </Box>
              </Section>
            )}

            {analysis.interpretation && (
              <Section title="해석">
                <Text dot="text-sm text-gray-700" style={{ lineHeight: 20 }}>
                  {analysis.interpretation}
                </Text>
              </Section>
            )}
          </Box>
        )}
      </Box>
    </ScrollView>
  );
}
