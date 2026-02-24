/**
 * Tests for i18n/prefer-common-key rule
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { RuleTester } from 'eslint';
import * as path from 'path';
import preferCommonKey from '../rules/prefer-common-key';
import { clearTranslationCache } from '../utils/translation-loader';

const translationsDir = path.resolve(
  __dirname,
  'fixtures/translations',
);

beforeEach(() => {
  clearTranslationCache();
});

// ========================================
// Vitest — module shape
// ========================================

describe('prefer-common-key — module', () => {
  it('exports a valid ESLint rule', () => {
    expect(preferCommonKey).toBeDefined();
    expect(preferCommonKey.meta?.type).toBe('suggestion');
    expect(preferCommonKey.meta?.hasSuggestions).toBe(true);
    expect(preferCommonKey.create).toBeTypeOf('function');
  });

  it('has correct messages', () => {
    expect(preferCommonKey.meta?.messages).toHaveProperty('preferCommon');
    expect(preferCommonKey.meta?.messages).toHaveProperty('useCommonKey');
  });
});

// ========================================
// RuleTester — core behavior
// ========================================

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

ruleTester.run('prefer-common-key', preferCommonKey, {
  valid: [
    // Already using common namespace
    {
      code: "t('common:actions.save')",
      options: [{ translationsDir }],
    },
    // Key value not in common namespace
    {
      code: "t('diary:title')",
      options: [{ translationsDir }],
    },
    // Dynamic key — skipped
    {
      code: 't(dynamicKey)',
      options: [{ translationsDir }],
    },
    // No translationsDir — returns {}
    {
      code: "t('diary:save_button')",
    },
    // Non-matching function name
    {
      code: "translate('diary:save_button')",
      options: [{ translationsDir }],
    },
    // Key doesn't exist in translations
    {
      code: "t('diary:nonexistent')",
      options: [{ translationsDir }],
    },
  ],
  invalid: [
    // diary:save_button has value "저장" which is also common:actions.save
    {
      code: "t('diary:save_button')",
      options: [{ translationsDir }],
      errors: [
        {
          messageId: 'preferCommon',
          suggestions: [
            {
              messageId: 'useCommonKey',
              output: "t('common:actions.save')",
            },
          ],
        },
      ],
    },
    // settings:confirm has value "확인" which is also common:actions.confirm
    {
      code: "t('settings:confirm')",
      options: [{ translationsDir }],
      errors: [
        {
          messageId: 'preferCommon',
          suggestions: [
            {
              messageId: 'useCommonKey',
              output: "t('common:actions.confirm')",
            },
          ],
        },
      ],
    },
  ],
});

// ========================================
// Edge cases
// ========================================

const edgeTester = new RuleTester({
  languageOptions: { ecmaVersion: 2020, sourceType: 'module' },
});

edgeTester.run('prefer-common-key — member expression', preferCommonKey, {
  valid: [],
  invalid: [
    // Member expression i18n.t()
    {
      code: "i18n.t('diary:save_button')",
      options: [{ translationsDir }],
      errors: [
        {
          messageId: 'preferCommon',
          suggestions: [
            {
              messageId: 'useCommonKey',
              output: "i18n.t('common:actions.save')",
            },
          ],
        },
      ],
    },
  ],
});

edgeTester.run('prefer-common-key — custom function names', preferCommonKey, {
  valid: [
    // 't' is not in custom function names
    {
      code: "t('diary:save_button')",
      options: [{ translationsDir, functionNames: ['tr'] }],
    },
  ],
  invalid: [
    // Custom function name 'tr'
    {
      code: "tr('diary:save_button')",
      options: [{ translationsDir, functionNames: ['tr'] }],
      errors: [
        {
          messageId: 'preferCommon',
          suggestions: [
            {
              messageId: 'useCommonKey',
              output: "tr('common:actions.save')",
            },
          ],
        },
      ],
    },
  ],
});
