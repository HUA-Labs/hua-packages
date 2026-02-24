/**
 * Tests for i18n/no-unlocalized-field rule
 */
import { RuleTester } from 'eslint';
import noUnlocalizedField from '../rules/no-unlocalized-field';

// ========================================
// RuleTester — core behavior
// ========================================

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

ruleTester.run('no-unlocalized-field', noUnlocalizedField, {
  valid: [
    // Valid i18n key in description
    {
      code: 'const x = { description: "docs:components.button.description" }',
    },
    // Hyphenated namespace
    {
      code: 'const x = { description: "docs-cards:some.key" }',
    },
    // Underscore namespace
    {
      code: 'const x = { description: "my_ns:some.key" }',
    },
    // ALWAYS_IGNORED properties — not checked regardless
    {
      code: 'const x = { type: "string" }',
    },
    {
      code: 'const x = { name: "Button" }',
    },
    {
      code: 'const x = { id: "btn-1", category: "ui", version: "1.0" }',
    },
    {
      code: 'const x = { href: "/about", url: "https://example.com" }',
    },
    {
      code: 'const x = { code: "const a = 1;", className: "p-4" }',
    },
    // Empty string — ignored
    {
      code: 'const x = { description: "" }',
    },
    // Whitespace only — ignored
    {
      code: 'const x = { description: "   " }',
    },
    // Non-string value (number) — ignored
    {
      code: 'const x = { description: 42 }',
    },
    // Boolean value — ignored
    {
      code: 'const x = { description: true }',
    },
    // Variable reference — ignored (not a Literal)
    {
      code: 'const x = { description: someVar }',
    },
    // Function call — ignored
    {
      code: 'const x = { description: t("docs:key") }',
    },
    // Computed property — ignored
    {
      code: 'const x = { [dynamicProp]: "literal string" }',
    },
    // Non-target field with literal — not in default fields
    {
      code: 'const x = { title: "Some Title" }',
    },
    // Inside codeExamples parent — ignored
    {
      code: 'const x = { codeExamples: [{ description: "Example usage" }] }',
    },
    // Custom fields — only check 'label', not 'description'
    {
      code: 'const x = { description: "Not an i18n key" }',
      options: [{ fields: ['label'] }],
    },
    // Custom pattern — relaxed pattern allows any string with colon
    {
      code: 'const x = { description: "anything:here" }',
      options: [{ pattern: '^.+:.+$' }],
    },
    // Deep nesting with valid key
    {
      code: 'const x = { description: "docs:components.button.props.variant.description" }',
    },
  ],
  invalid: [
    // Plain English literal in description
    {
      code: 'const x = { description: "A plain text description" }',
      errors: [{ messageId: 'unlocalizedField' }],
    },
    // Single word
    {
      code: 'const x = { description: "Button" }',
      errors: [{ messageId: 'unlocalizedField' }],
    },
    // description with configured fields: ['description', 'label']
    {
      code: 'const x = { label: "Submit" }',
      options: [{ fields: ['description', 'label'] }],
      errors: [{ messageId: 'unlocalizedField' }],
    },
    {
      code: 'const x = { value: "Option A" }',
      options: [{ fields: ['value'] }],
      errors: [{ messageId: 'unlocalizedField' }],
    },
    // Multiple unlocalized fields — each one reported
    {
      code: 'const x = { description: "Hello", label: "World" }',
      options: [{ fields: ['description', 'label'] }],
      errors: [
        { messageId: 'unlocalizedField' },
        { messageId: 'unlocalizedField' },
      ],
    },
    // String that looks like a key but missing namespace
    {
      code: 'const x = { description: "components.button" }',
      errors: [{ messageId: 'unlocalizedField' }],
    },
  ],
});

// ========================================
// Edge Cases
// ========================================

const edgeTester = new RuleTester({
  languageOptions: { ecmaVersion: 2020, sourceType: 'module' },
});

edgeTester.run('no-unlocalized-field — edge: URL & special strings', noUnlocalizedField, {
  valid: [],
  invalid: [
    // URL-like string in description (not a valid i18n key)
    {
      code: 'const x = { description: "https://example.com/docs" }',
      errors: [{ messageId: 'unlocalizedField' }],
    },
    // Only namespace, trailing colon
    {
      code: 'const x = { description: "docs:" }',
      errors: [{ messageId: 'unlocalizedField' }],
    },
    // Multiple colons
    {
      code: 'const x = { description: "a:b:c" }',
      errors: [{ messageId: 'unlocalizedField' }],
    },
    // Numeric string (no namespace)
    {
      code: 'const x = { description: "123" }',
      errors: [{ messageId: 'unlocalizedField' }],
    },
  ],
});

edgeTester.run('no-unlocalized-field — edge: long string truncation', noUnlocalizedField, {
  valid: [],
  invalid: [
    {
      code: `const x = { description: "${'A'.repeat(60)}" }`,
      errors: [{ messageId: 'unlocalizedField' }],
    },
  ],
});

edgeTester.run('no-unlocalized-field — edge: string literal property key', noUnlocalizedField, {
  valid: [
    {
      code: 'const x = { "description": "docs:some.key" }',
    },
  ],
  invalid: [
    {
      code: 'const x = { "description": "Not a key" }',
      errors: [{ messageId: 'unlocalizedField' }],
    },
  ],
});

edgeTester.run('no-unlocalized-field — edge: custom ignoreParentProperties', noUnlocalizedField, {
  valid: [
    // Custom ignore list includes 'examples'
    {
      code: 'const x = { examples: [{ description: "Example text" }] }',
      options: [{ ignoreParentProperties: ['examples'] }],
    },
  ],
  invalid: [
    // Default codeExamples not in custom list → flags
    {
      code: 'const x = { codeExamples: [{ description: "Example text" }] }',
      options: [{ ignoreParentProperties: ['examples'] }],
      errors: [{ messageId: 'unlocalizedField' }],
    },
  ],
});

edgeTester.run('no-unlocalized-field — edge: deeply nested ignored parent', noUnlocalizedField, {
  valid: [
    {
      code: 'const x = { codeExamples: { nested: { deep: { description: "literal" } } } }',
    },
  ],
  invalid: [],
});

edgeTester.run('no-unlocalized-field — edge: hyphen in key path', noUnlocalizedField, {
  valid: [
    {
      code: 'const x = { description: "docs:components.mini-bar-chart.description" }',
    },
  ],
  invalid: [],
});

edgeTester.run('no-unlocalized-field — edge: template literal value ignored', noUnlocalizedField, {
  valid: [
    {
      code: 'const x = { description: `template ${value}` }',
    },
  ],
  invalid: [],
});
