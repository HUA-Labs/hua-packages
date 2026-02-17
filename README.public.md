# HUA Platform

> Engineering Emotion — UI, Motion, i18n in one framework.

Open-source React framework for building emotionally resonant user experiences. Combines UI components, motion system, and internationalization into a unified developer experience.

## Quick Start

```bash
# Start a new HUA project
npx create-hua my-app
cd my-app
pnpm dev
```

Or add to an existing project:

```bash
pnpm add @hua-labs/hua
```

## Packages

### Core Framework

| Package | Version | Description |
|---------|---------|-------------|
| [`@hua-labs/hua`](./packages/hua) | [![npm](https://img.shields.io/npm/v/@hua-labs/hua)](https://www.npmjs.com/package/@hua-labs/hua) | Unified framework: UI + Motion + i18n |
| [`@hua-labs/ui`](./packages/hua-ui) | [![npm](https://img.shields.io/npm/v/@hua-labs/ui)](https://www.npmjs.com/package/@hua-labs/ui) | 100+ React UI components |
| [`create-hua`](./packages/create-hua) | [![npm](https://img.shields.io/npm/v/create-hua)](https://www.npmjs.com/package/create-hua) | Project scaffolding CLI |

### i18n (Internationalization)

| Package | Version | Description |
|---------|---------|-------------|
| [`@hua-labs/i18n-core`](./packages/hua-i18n-core) | [![npm](https://img.shields.io/npm/v/@hua-labs/i18n-core)](https://www.npmjs.com/package/@hua-labs/i18n-core) | SSR-ready, zero-flicker i18n |
| [`@hua-labs/i18n-core-zustand`](./packages/hua-i18n-core-zustand) | [![npm](https://img.shields.io/npm/v/@hua-labs/i18n-core-zustand)](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand) | Zustand store adapter |
| [`@hua-labs/i18n-loaders`](./packages/hua-i18n-loaders) | [![npm](https://img.shields.io/npm/v/@hua-labs/i18n-loaders)](https://www.npmjs.com/package/@hua-labs/i18n-loaders) | Translation loaders (JSON, YAML, API) |
| [`@hua-labs/i18n-formatters`](./packages/hua-i18n-formatters) | [![npm](https://img.shields.io/npm/v/@hua-labs/i18n-formatters)](https://www.npmjs.com/package/@hua-labs/i18n-formatters) | Date, number, relative time formatters |

### Motion (Animation)

| Package | Version | Description |
|---------|---------|-------------|
| [`@hua-labs/motion-core`](./packages/hua-motion-core) | [![npm](https://img.shields.io/npm/v/@hua-labs/motion-core)](https://www.npmjs.com/package/@hua-labs/motion-core) | Zero-dependency animation hooks |

### Utilities

| Package | Version | Description |
|---------|---------|-------------|
| [`@hua-labs/state`](./packages/hua-state) | [![npm](https://img.shields.io/npm/v/@hua-labs/state)](https://www.npmjs.com/package/@hua-labs/state) | State management (Zustand-based) |
| [`@hua-labs/hooks`](./packages/hua-hooks) | [![npm](https://img.shields.io/npm/v/@hua-labs/hooks)](https://www.npmjs.com/package/@hua-labs/hooks) | Shared React hooks |
| [`@hua-labs/utils`](./packages/hua-utils) | [![npm](https://img.shields.io/npm/v/@hua-labs/utils)](https://www.npmjs.com/package/@hua-labs/utils) | Common utility functions |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.9 |
| Runtime | React 19 |
| Styling | Tailwind CSS |
| State | Zustand |
| Build | Turborepo, tsup |
| Testing | Vitest |

## Development

### Requirements

- Node.js 22.x
- pnpm 10.17.0+

### Install & Run

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm type-check       # Type check
pnpm lint             # Lint
pnpm test             # Run tests
```

## Links

- [HUA Docs](https://docs.hua-labs.com) — Framework documentation
- [HUA Labs](https://hua-labs.com) — Official site
- [npm: @hua-labs/hua](https://www.npmjs.com/package/@hua-labs/hua)
- [GitHub Issues](https://github.com/HUA-Labs/HUA-Labs-public/issues)

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

Built with care by [HUA Labs](https://hua-labs.com)
