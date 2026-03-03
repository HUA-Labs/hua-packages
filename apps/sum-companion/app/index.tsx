import { ScrollView } from 'react-native';
import { Box, Text, Pressable } from '@hua-labs/ui/native';
import { dot } from '@hua-labs/dot/native';
import { useState } from 'react';

const samples = [
  'p-4 bg-cyan-500',
  'mx-2 my-4 rounded-lg',
  'flex-1 items-center justify-center',
  'text-lg font-bold text-white',
  'w-full h-12 border border-gray-300',
  'gap-2 flex-row',
] as const;

export default function HomeScreen() {
  const [pressCount, setPressCount] = useState(0);

  return (
    <ScrollView style={dot('flex-1 bg-white')}>
      <Box dot="p-6">
        <Text dot="text-2xl font-bold mb-4">
          hua-ui native primitives
        </Text>
        <Text dot="text-sm text-gray-500 mb-6">
          Box, Text, Pressable from @hua-labs/ui/native — powered by dot engine.
        </Text>

        <Pressable
          dot="mb-6 p-4 rounded-lg bg-cyan-500 active:bg-cyan-700"
          onPress={() => setPressCount((c) => c + 1)}
        >
          <Text dot="text-base font-semibold text-white text-center">
            Pressed {pressCount} times
          </Text>
        </Pressable>

        {samples.map((input) => {
          const resolved = dot(input);
          return (
            <Box
              key={input}
              dot="mb-4 p-4 rounded-lg border border-gray-200"
              style={{ backgroundColor: '#f9fafb' }}
            >
              <Text dot="text-sm font-semibold text-cyan-700 mb-2">
                {input}
              </Text>
              <Text dot="text-xs text-gray-600">
                {JSON.stringify(resolved, null, 2)}
              </Text>
            </Box>
          );
        })}
      </Box>
    </ScrollView>
  );
}
