/**
 * Tests for i18n/no-missing-key rule
 */
import { RuleTester } from 'eslint';
import * as path from 'path';
import noMissingKey from '../rules/no-missing-key';

const keysFixture = path.resolve(__dirname, 'fixtures/test-keys.generated.ts');
const nonexistentFile = path.resolve(__dirname, 'fixtures/nonexistent-keys.ts');

// ========================================
// RuleTester — core behavior
// ========================================

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

ruleTester.run('no-missing-key', noMissingKey, {
  valid: [
    // Valid keys from fixture
    {
      code: "t('common:welcome')",
      options: [{ keysFile: keysFixture }],
    },
    {
      code: "t('common:goodbye')",
      options: [{ keysFile: keysFixture }],
    },
    {
      code: "t('user:profile.name')",
      options: [{ keysFile: keysFixture }],
    },
    // Hyphenated namespace
    {
      code: "t('docs-cards:title')",
      options: [{ keysFile: keysFixture }],
    },
    // tArray with valid array key
    {
      code: "tArray('common:items')",
      options: [{ keysFile: keysFixture }],
    },
    // Member expression
    {
      code: "i18n.t('common:save')",
      options: [{ keysFile: keysFixture }],
    },
    // Dynamic key — not a string literal, ignored by this rule
    {
      code: 't(dynamicKey)',
      options: [{ keysFile: keysFixture }],
    },
    // Template literal — not a string literal, ignored
    {
      code: 't(`common:${key}`)',
      options: [{ keysFile: keysFixture }],
    },
    // No keysFile option → no checking (returns {})
    {
      code: "t('any:nonexistent.key')",
    },
    // No arguments — no crash
    {
      code: 't()',
      options: [{ keysFile: keysFixture }],
    },
    // Non-string first argument (number)
    {
      code: 't(42)',
      options: [{ keysFile: keysFixture }],
    },
    // Custom function name — default list doesn't include 'translate'
    {
      code: "translate('nonexistent:key')",
      options: [{ keysFile: keysFixture }],
    },
    // Custom function name — 'tr' is checked, but valid key
    {
      code: "tr('common:welcome')",
      options: [{ keysFile: keysFixture, functionNames: ['tr'] }],
    },
  ],
  invalid: [
    // Key not in fixture
    {
      code: "t('common:nonexistent')",
      options: [{ keysFile: keysFixture }],
      errors: [{ messageId: 'missingKey' }],
    },
    // Wrong namespace
    {
      code: "t('unknown:welcome')",
      options: [{ keysFile: keysFixture }],
      errors: [{ messageId: 'missingKey' }],
    },
    // tArray with missing key
    {
      code: "tArray('common:nonexistent')",
      options: [{ keysFile: keysFixture }],
      errors: [{ messageId: 'missingKey' }],
    },
    // Member expression with missing key
    {
      code: "i18n.t('user:nonexistent')",
      options: [{ keysFile: keysFixture }],
      errors: [{ messageId: 'missingKey' }],
    },
    // keysFile doesn't exist
    {
      code: "t('common:welcome')",
      options: [{ keysFile: nonexistentFile }],
      errors: [{ messageId: 'noKeysFile' }],
    },
    // Custom function name — 'tr' is checked
    {
      code: "tr('common:nonexistent')",
      options: [{ keysFile: keysFixture, functionNames: ['tr'] }],
      errors: [{ messageId: 'missingKey' }],
    },
  ],
});

// ========================================
// Edge Cases
// ========================================

const edgeTester = new RuleTester({
  languageOptions: { ecmaVersion: 2020, sourceType: 'module' },
});

edgeTester.run('no-missing-key — edge: empty & malformed keys', noMissingKey, {
  valid: [],
  invalid: [
    // Empty string key
    {
      code: "t('')",
      options: [{ keysFile: keysFixture }],
      errors: [{ messageId: 'missingKey' }],
    },
    // Key without namespace separator
    {
      code: "t('welcome')",
      options: [{ keysFile: keysFixture }],
      errors: [{ messageId: 'missingKey' }],
    },
    // Key with trailing dot — did-you-mean suggests common:welcome
    {
      code: "t('common:welcome.')",
      options: [{ keysFile: keysFixture }],
      errors: [
        {
          messageId: 'missingKeyDidYouMean',
          suggestions: [
            { messageId: 'suggestKey', output: "t('common:welcome')" },
          ],
        },
      ],
    },
  ],
});

edgeTester.run('no-missing-key — edge: deep nesting', noMissingKey, {
  valid: [
    {
      code: "t('user:settings.theme')",
      options: [{ keysFile: keysFixture }],
    },
  ],
  invalid: [
    // Extra path segment
    {
      code: "t('user:settings.theme.color')",
      options: [{ keysFile: keysFixture }],
      errors: [{ messageId: 'missingKey' }],
    },
  ],
});

edgeTester.run('no-missing-key — edge: case sensitivity', noMissingKey, {
  valid: [],
  invalid: [
    // Wrong case in key — did-you-mean suggests common:welcome
    {
      code: "t('common:Welcome')",
      options: [{ keysFile: keysFixture }],
      errors: [
        {
          messageId: 'missingKeyDidYouMean',
          suggestions: [
            { messageId: 'suggestKey', output: "t('common:welcome')" },
          ],
        },
      ],
    },
    // Wrong case in namespace — did-you-mean suggests common:welcome
    {
      code: "t('Common:welcome')",
      options: [{ keysFile: keysFixture }],
      errors: [
        {
          messageId: 'missingKeyDidYouMean',
          suggestions: [
            { messageId: 'suggestKey', output: "t('common:welcome')" },
          ],
        },
      ],
    },
  ],
});

edgeTester.run('no-missing-key — edge: multiple calls in same code', noMissingKey, {
  valid: [],
  invalid: [
    // First call valid, second invalid — only second flagged
    {
      code: "t('common:welcome'); t('common:nonexistent')",
      options: [{ keysFile: keysFixture }],
      errors: [{ messageId: 'missingKey' }],
    },
  ],
});

// ========================================
// Did-you-mean suggestions
// ========================================

const dymTester = new RuleTester({
  languageOptions: { ecmaVersion: 2020, sourceType: 'module' },
});

dymTester.run('no-missing-key — did-you-mean: close typos', noMissingKey, {
  valid: [],
  invalid: [
    // One char off → suggests common:welcome
    {
      code: "t('common:welcom')",
      options: [{ keysFile: keysFixture }],
      errors: [
        {
          messageId: 'missingKeyDidYouMean',
          suggestions: [
            { messageId: 'suggestKey', output: "t('common:welcome')" },
          ],
        },
      ],
    },
    // Trailing dot → suggests common:welcome
    {
      code: "t('common:welcome.')",
      options: [{ keysFile: keysFixture }],
      errors: [
        {
          messageId: 'missingKeyDidYouMean',
          suggestions: [
            { messageId: 'suggestKey', output: "t('common:welcome')" },
          ],
        },
      ],
    },
    // Wrong case → suggests common:welcome
    {
      code: "t('common:Welcome')",
      options: [{ keysFile: keysFixture }],
      errors: [
        {
          messageId: 'missingKeyDidYouMean',
          suggestions: [
            { messageId: 'suggestKey', output: "t('common:welcome')" },
          ],
        },
      ],
    },
  ],
});

dymTester.run('no-missing-key — did-you-mean: no suggestions for distant keys', noMissingKey, {
  valid: [],
  invalid: [
    // Completely different key — no close match, falls back to plain missingKey
    {
      code: "t('unknown:xyz')",
      options: [{ keysFile: keysFixture }],
      errors: [{ messageId: 'missingKey' }],
    },
  ],
});
