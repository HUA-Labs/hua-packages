/**
 * 권장 룰셋
 */
export const recommended = {
  plugins: ['@hua-labs/i18n'],
  rules: {
    '@hua-labs/i18n/no-missing-key': 'error',
    '@hua-labs/i18n/no-raw-text': 'warn',
    '@hua-labs/i18n/no-dynamic-key': 'warn',
    '@hua-labs/i18n/no-unused-key': 'off',
  },
};
