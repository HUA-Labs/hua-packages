/**
 * Tests for i18n/no-dynamic-key rule
 */
import { RuleTester } from 'eslint';
import noDynamicKey from '../rules/no-dynamic-key';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

ruleTester.run('no-dynamic-key', noDynamicKey, {
  valid: [
    // Static string literals are valid
    {
      code: "t('common:greeting')",
    },
    {
      code: "t('user:profile.name')",
    },
    {
      code: "tArray('common:items')",
    },
    // Member expression with static key
    {
      code: "i18n.t('common:greeting')",
    },
    // Allowed pattern (template literal matching allowPatterns)
    {
      code: "t(`analysis:metrics.${key}`)",
      options: [
        {
          allowPatterns: ['^analysis:metrics\\.'],
        },
      ],
    },
    // Custom function names - should not flag when not in functionNames
    {
      code: "translate(variable)",
      options: [
        {
          functionNames: ['t', 'tArray'],
        },
      ],
    },
  ],
  invalid: [
    // Variable as key
    {
      code: 't(key)',
      errors: [
        {
          messageId: 'dynamicKey',
        },
      ],
    },
    // Template literal without allowPattern
    {
      code: 't(`user:${userId}.name`)',
      errors: [
        {
          messageId: 'dynamicKey',
        },
      ],
    },
    // Expression as key
    {
      code: "t('user:' + userId)",
      errors: [
        {
          messageId: 'dynamicKey',
        },
      ],
    },
    // Member expression with dynamic key
    {
      code: 'i18n.t(dynamicKey)',
      errors: [
        {
          messageId: 'dynamicKey',
        },
      ],
    },
    // tArray with dynamic key
    {
      code: 'tArray(variable)',
      errors: [
        {
          messageId: 'dynamicKey',
        },
      ],
    },
    // Template literal that doesn't match allowPattern
    {
      code: 't(`other:${key}`)',
      options: [
        {
          allowPatterns: ['^analysis:metrics\\.'],
        },
      ],
      errors: [
        {
          messageId: 'dynamicKey',
        },
      ],
    },
  ],
});
