import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/__tests__/**',
        '**/__mocks__/**',
      ],
    },
  },
  resolve: {
    alias: [
      { find: '@hua-labs/dot/class', replacement: path.resolve(__dirname, '../hua-dot/src/class.ts') },
      { find: '@hua-labs/dot', replacement: path.resolve(__dirname, '../hua-dot/src/index.ts') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
});
