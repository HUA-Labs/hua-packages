/**
 * Tests for i18n/no-raw-text rule (RuleTester)
 */
import { RuleTester } from 'eslint';
import noRawText from '../rules/no-raw-text';

// ========================================
// RuleTester — core behavior
// ========================================

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('no-raw-text', noRawText, {
  valid: [
    // English text in JSX — no CJK
    {
      code: '<Button>Click me</Button>',
    },
    // Numbers and symbols
    {
      code: '<span>123</span>',
    },
    {
      code: '<span>$100</span>',
    },
    // Whitespace
    {
      code: '<span>   </span>',
    },
    // Empty
    {
      code: '<span></span>',
    },
    // Expression — not JSXText
    {
      code: '<span>{t("common:save")}</span>',
    },
    // English in checkable attributes
    {
      code: '<input placeholder="Enter text" />',
    },
    {
      code: '<img alt="Profile photo" />',
    },
    // Non-checkable attribute with CJK — not checked
    {
      code: '<div data-label="\uD55C\uAE00" />',
    },
    {
      code: '<div className="\uD55C\uAE00" />',
    },
    // Brand name in allowedTerms
    {
      code: '<span>\uD55C\uD654</span>',
      options: [{ allowedTerms: ['\uD55C\uD654'] }],
    },
    // CJK in non-default attribute — not checked unless configured
    {
      code: '<div data-tooltip="\uC124\uBA85\uC785\uB2C8\uB2E4" />',
    },
  ],
  invalid: [
    // Korean text in JSX
    {
      code: '<Button>\uC800\uC7A5\uD558\uAE30</Button>',
      errors: [{ messageId: 'rawText' }],
    },
    // Japanese (Hiragana)
    {
      code: '<div>\u3053\u3093\u306B\u3061\u306F</div>',
      errors: [{ messageId: 'rawText' }],
    },
    // Chinese
    {
      code: '<p>\u4F60\u597D\u4E16\u754C</p>',
      errors: [{ messageId: 'rawText' }],
    },
    // Japanese (Katakana)
    {
      code: '<span>\u30AB\u30BF\u30AB\u30CA</span>',
      errors: [{ messageId: 'rawText' }],
    },
    // Korean in aria-label attribute
    {
      code: '<div aria-label="\uB2EB\uAE30" />',
      errors: [{ messageId: 'rawAttr' }],
    },
    // Korean in placeholder
    {
      code: '<input placeholder="\uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694" />',
      errors: [{ messageId: 'rawAttr' }],
    },
    // Korean in alt
    {
      code: '<img alt="\uD504\uB85C\uD544 \uC0AC\uC9C4" />',
      errors: [{ messageId: 'rawAttr' }],
    },
    // Korean in title
    {
      code: '<div title="\uC81C\uBAA9" />',
      errors: [{ messageId: 'rawAttr' }],
    },
    // CJK in custom checkAttributes
    {
      code: '<div data-tooltip="\uC124\uBA85\uC785\uB2C8\uB2E4" />',
      options: [{ checkAttributes: ['data-tooltip'] }],
      errors: [{ messageId: 'rawAttr' }],
    },
  ],
});

// ========================================
// Edge Cases
// ========================================

const edgeTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

edgeTester.run('no-raw-text — edge: mixed CJK + English', noRawText, {
  valid: [],
  invalid: [
    {
      code: '<Button>Save \uC800\uC7A5</Button>',
      errors: [{ messageId: 'rawText' }],
    },
  ],
});

edgeTester.run('no-raw-text — edge: single CJK character', noRawText, {
  valid: [],
  invalid: [
    {
      code: '<span>\uAE00</span>',
      errors: [{ messageId: 'rawText' }],
    },
  ],
});

edgeTester.run('no-raw-text — edge: CJK surrounded by whitespace', noRawText, {
  valid: [],
  invalid: [
    {
      code: '<span>  \uD55C\uAE00  </span>',
      errors: [{ messageId: 'rawText' }],
    },
  ],
});

edgeTester.run('no-raw-text — edge: allowedTerms', noRawText, {
  valid: [
    {
      code: '<span>\uD55C\uD654</span>',
      options: [{ allowedTerms: ['\uD55C\uD654'] }],
    },
  ],
  invalid: [
    // Different term not in allowedTerms
    {
      code: '<span>\uC0BC\uC131</span>',
      options: [{ allowedTerms: ['\uD55C\uD654'] }],
      errors: [{ messageId: 'rawText' }],
    },
  ],
});

edgeTester.run('no-raw-text — edge: multiple CJK nodes', noRawText, {
  valid: [],
  invalid: [
    {
      code: '<div><span>\uD55C\uAE00</span><span>\uC77C\uBCF8\uC5B4</span></div>',
      errors: [
        { messageId: 'rawText' },
        { messageId: 'rawText' },
      ],
    },
  ],
});

edgeTester.run('no-raw-text — edge: label attribute CJK', noRawText, {
  valid: [],
  invalid: [
    {
      code: '<Button label="\uC800\uC7A5" />',
      errors: [{ messageId: 'rawAttr' }],
    },
  ],
});

edgeTester.run('no-raw-text — edge: JSX expression not flagged', noRawText, {
  valid: [
    {
      code: '<input placeholder={t("common:enter")} />',
    },
  ],
  invalid: [],
});

edgeTester.run('no-raw-text — edge: CJK Ext. A range', noRawText, {
  valid: [],
  invalid: [
    // U+3400 (CJK Unified Ideographs Extension A)
    {
      code: '<span>\u3400</span>',
      errors: [{ messageId: 'rawText' }],
    },
  ],
});

edgeTester.run('no-raw-text — edge: symbols and numbers only — allowed', noRawText, {
  valid: [
    { code: '<span>$1,234.56</span>' },
    { code: '<span>2026-02-24</span>' },
    { code: '<span>100%</span>' },
    { code: '<span>\u2192</span>' },
  ],
  invalid: [],
});
