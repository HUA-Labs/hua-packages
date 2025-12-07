import js from '@eslint/js';

// Storybook plugin is optional - only used in packages that have storybook
// If needed, install eslint-plugin-storybook in the root package.json

export default [js.configs.recommended, {
  files: ['**/*.{js,jsx,mjs,cjs}'],
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    globals: {
      console: 'readonly',
      process: 'readonly',
      Buffer: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      global: 'readonly',
      module: 'readonly',
      require: 'readonly',
      exports: 'readonly',
      window: 'readonly',
      document: 'readonly',
      navigator: 'readonly',
      fetch: 'readonly',
      sessionStorage: 'readonly',
      localStorage: 'readonly',
      setTimeout: 'readonly',
      clearTimeout: 'readonly',
      setInterval: 'readonly',
      clearInterval: 'readonly',
      CustomEvent: 'readonly',
    },
  },
  rules: {
    'no-unused-vars': 'warn',
    'prefer-const': 'warn',
    'no-var': 'warn',
    'no-undef': 'off',
  },
}, {
  ignores: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '*.config.js',
    '*.config.mjs',
    '**/*.ts',
    '**/*.tsx',
  ],
}]; 