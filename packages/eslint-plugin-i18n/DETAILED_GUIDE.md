# @hua-labs/eslint-plugin-i18n Detailed Guide

`@hua-labs/eslint-plugin-i18n` helps keep translation usage type-safe and
reviewable. It catches missing keys, dynamic key lookups, hardcoded text,
unlocalized metadata fields, and repeated strings that should move to a common
namespace.

## Installation

```bash
pnpm add -D @hua-labs/eslint-plugin-i18n
```

The plugin supports ESLint 8 and newer. It can be used from flat config or from
legacy `.eslintrc` config.

## Flat Config

```js
// eslint.config.mjs
import i18nPlugin from "@hua-labs/eslint-plugin-i18n";

export default [
  {
    plugins: {
      i18n: i18nPlugin,
    },
    rules: {
      "i18n/no-missing-key": [
        "error",
        {
          keysFile: "./types/i18n-types.generated.ts",
        },
      ],
      "i18n/no-raw-text": [
        "warn",
        {
          translationsDir: "./lib/translations",
        },
      ],
      "i18n/no-dynamic-key": "warn",
      "i18n/prefer-common-key": [
        "warn",
        {
          translationsDir: "./lib/translations",
        },
      ],
    },
  },
];
```

## Legacy Config

```json
{
  "plugins": ["i18n"],
  "rules": {
    "i18n/no-missing-key": [
      "error",
      {
        "keysFile": "./types/i18n-types.generated.ts"
      }
    ],
    "i18n/no-raw-text": [
      "warn",
      {
        "translationsDir": "./lib/translations"
      }
    ],
    "i18n/no-dynamic-key": "warn"
  }
}
```

Use flat config for new projects. Legacy config is useful when an existing
project has not migrated yet.

## Rule Setup

### `i18n/no-missing-key`

Checks calls such as `t('common.save')` against a generated key type file. The
rule is most useful when the key list is generated as part of the normal build
or translation sync process.

```js
{
  'i18n/no-missing-key': [
    'error',
    {
      keysFile: './types/i18n-types.generated.ts',
      functionNames: ['t', 'tArray'],
    },
  ],
}
```

When the rule finds a near match, it reports suggestions so common typos are
easy to fix during review.

Generated `I18nKeys` interfaces may use unquoted, single-quoted, or
double-quoted namespace names. Static `strings` and `arrays` key literals may
use either single or double quotes, including inline unions and the usual
multiline `| "key"` form. The rule does not claim support for computed
properties or other dynamic TypeScript expressions in the generated file.

### `i18n/no-raw-text`

Finds CJK hardcoded text in JSX and can suggest existing translation keys when
`translationsDir` points at local translation files.

```js
{
  'i18n/no-raw-text': [
    'warn',
    {
      translationsDir: './lib/translations',
      ignorePattern: '^[\\s\\d.,:;!?()\\[\\]{}-]+$',
    },
  ],
}
```

Keep this rule at `warn` while migrating a large codebase, then tighten it after
the known text surface is moved to translation files.

### `i18n/no-dynamic-key`

Warns when translation keys are assembled dynamically. Prefer literal keys so
missing-key checks and extraction tools can see the full translation surface.

```ts
t("common.save"); // ok
t(`common.${action}`); // reported
```

### `i18n/no-unlocalized-field`

Checks metadata files where fields such as `description`, `label`, or `value`
should contain translation keys instead of display strings.

```js
{
  files: ['registry/**/*.ts'],
  plugins: { i18n: i18nPlugin },
  rules: {
    'i18n/no-unlocalized-field': [
      'warn',
      {
        fields: ['description', 'label', 'value'],
        ignoreParentProperties: ['codeExamples'],
      },
    ],
  },
}
```

### `i18n/prefer-common-key`

Reports values that already exist in a common namespace. This helps keep shared
labels such as "Save", "Cancel", and "Delete" from drifting across feature
namespaces.

### `i18n/no-unused-key`

This rule is intentionally light. For full unused-key detection, use the
`i18n-lint` CLI because project-wide analysis needs the whole translation tree
and source tree.

## CLI

The package exposes an `i18n-lint` binary.

```bash
pnpm exec i18n-lint unused-keys --translations-dir ./lib/translations --source-dir ./src
pnpm exec i18n-lint common-report --translations-dir ./lib/translations
pnpm exec i18n-lint missing --translations-dir ./lib/translations --languages en,ja
```

Use the CLI for checks that need more context than a single ESLint file visit.
For CI, run ESLint first for editor-facing diagnostics, then run `i18n-lint`
for project-level translation reports.

## Migration Workflow

1. Start with `no-dynamic-key` and `no-missing-key` on a small directory.
2. Add `no-raw-text` as a warning and review the first report manually.
3. Add `no-unlocalized-field` only to metadata or registry files.
4. Run the CLI on the full translation tree and fix unused or missing entries
   in batches.
5. Raise selected rules from `warn` to `error` once the project has a stable
   translation generation step.

## Troubleshooting

If `no-missing-key` reports every key as missing, check that `keysFile` points
to the generated type file visible from the ESLint working directory.
For generated `I18nKeys` declarations, keep namespace and key members as
static quoted or unquoted properties rather than computed expressions.

If key suggestions are missing, confirm that `translationsDir` points to the
directory containing the runtime translation JSON or TypeScript files.

If `no-raw-text` reports intentional examples, use `ignorePattern` or narrow the
rule to application source files instead of tests, stories, or fixtures.

If legacy config cannot resolve the plugin name, verify that the package is
installed in the workspace where ESLint runs and that the config references the
plugin as `i18n`.
