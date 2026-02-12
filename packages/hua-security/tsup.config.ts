import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    server: 'src/server.ts',
    pro: 'src/pro.ts',
    client: 'src/client.ts',
    adapters: 'src/adapters.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  external: ['@google-cloud/kms', 'server-only'],
});
