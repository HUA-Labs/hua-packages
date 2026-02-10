# create-hua

Interactively scaffold a Next.js + hua project.

[![npm version](https://img.shields.io/npm/v/create-hua.svg)](https://www.npmjs.com/package/create-hua)
[![npm downloads](https://img.shields.io/npm/dw/create-hua.svg)](https://www.npmjs.com/package/create-hua)
[![license](https://img.shields.io/npm/l/create-hua.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)

## Quick Start

```bash
npx create-hua my-app
cd my-app
pnpm install
pnpm dev
```

The CLI walks you through interactive prompts to choose AI context files and documentation language.

## What You Get

Generated project structure:

```
my-app/
├── app/                  # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/translations/ # i18n API route
├── components/           # LanguageToggle, etc.
├── lib/                  # i18n-setup, utils
├── store/                # Zustand store (useAppStore)
├── translations/         # ko/en JSON translation files
├── hua.config.ts         # hua framework config (preset, i18n, motion, state)
├── next.config.ts
├── tailwind.config.js    # Auto-generated with monorepo awareness
├── tsconfig.json
└── package.json          # Dependencies auto-configured
```

### Pre-wired Stack

| Category | Included |
|----------|----------|
| Framework | Next.js 16, React 19, TypeScript 5.9 |
| Styling | Tailwind CSS 4, PostCSS |
| State | Zustand 5 (SSR + persist pre-configured) |
| i18n | `@hua-labs/hua` i18n (ko/en, API route loader) |
| Motion | `@hua-labs/hua` motion (product/marketing presets) |
| Icons | Phosphor Icons |
| AI Context | .cursorrules, ai-context.md, .claude/ (optional) |

## CLI Options

```bash
npx create-hua <project-name> [options]
```

| Flag | Description |
|------|-------------|
| `--lang ko\|en\|both` | AI context documentation language (default: both) |
| `--claude-skills` | Include Claude skills files |
| `--no-cursorrules` | Skip .cursorrules generation |
| `--no-ai-context` | Skip ai-context.md generation |
| `--no-claude-context` | Skip .claude/project-context.md generation |
| `--install` | Run `pnpm install` automatically after creation |
| `--dry-run` | Preview without creating files |
| `--non-interactive` | Use defaults without prompts |
| `--english-only` | Display CLI messages in English only |

### Doctor Command

Diagnose an existing project's health:

```bash
npx create-hua doctor [path]
```

Checks: package.json, hua.config.ts, required directories, translation file JSON syntax, Node.js/pnpm versions.

## Configuration

The generated `hua.config.ts` controls most settings via presets:

```typescript
import { defineConfig } from '@hua-labs/hua/framework/config';

export default defineConfig({
  preset: 'product',      // 'product' | 'marketing'
  i18n: { defaultLanguage: 'ko', supportedLanguages: ['ko', 'en'] },
  motion: { defaultPreset: 'product', enableAnimations: true },
  state: { persist: true, ssr: true },
});
```

## Monorepo Support

Automatically detects pnpm workspace environments:

- Dependency versions resolve to `workspace:*`
- `tailwind.config.js` content paths reference monorepo packages directly

## Requirements

- Node.js >= 22.0.0
- pnpm

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua) — UI + motion + i18n + state framework
- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui) — React UI component library

> `create-hua-ux` has been renamed to this package. (deprecated)

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
