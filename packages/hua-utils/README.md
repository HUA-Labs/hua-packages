# @hua-labs/utils

A comprehensive utility library for the hua ecosystem. Includes class name merging (Tailwind-safe), formatters, performance utilities, validation, string manipulation, and sanitization functions.

[![npm version](https://img.shields.io/npm/v/@hua-labs/utils.svg)](https://www.npmjs.com/package/@hua-labs/utils)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/utils.svg)](https://www.npmjs.com/package/@hua-labs/utils)
[![license](https://img.shields.io/npm/l/@hua-labs/utils.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **cn() class merging — Tailwind-safe class name merging via clsx + tailwind-merge**
- **Formatters — Date, number, file size, relative time**
- **Performance — debounce, throttle, memoize, delay, retry**
- **Validation — Email, password, URL, phone number, range checks**
- **String utils — UUID, slugify, truncate, case conversion (camel/pascal/snake/kebab)**
- **Sanitization — XSS prevention, HTML escaping, email masking**

## Installation

```bash
pnpm add @hua-labs/utils
```

> Peer dependencies: react >=19.0.0

## Quick Start

```tsx
import { cn, formatTimeAgo, debounce, validateEmail, sanitizeInput } from '@hua-labs/utils';

// Tailwind class merging
const cls = cn('px-4 py-2 bg-blue-500', isActive && 'bg-blue-700', 'px-6');

// Formatting
formatTimeAgo(new Date('2026-02-07')); // "4 days ago"

// Performance
const debouncedSearch = debounce(search, 300);

// Validation & sanitization
validateEmail('test@example.com'); // true
sanitizeInput('<script>alert("xss")</script>'); // safe string

```

## API

| Export | Type | Description |
|--------|------|-------------|
| `cn` | function | Tailwind-safe class name merging (clsx + tailwind-merge) |
| `formatDate` | function |  |
| `formatNumber` | function |  |
| `formatFileSize` | function |  |
| `formatTimeAgo` | function |  |
| `debounce` | function | Debounce function calls with configurable delay |
| `throttle` | function | Throttle function calls |
| `memoize` | function |  |
| `delay` | function |  |
| `retry` | function |  |
| `validateEmail` | function | Email format validation |
| `validatePassword` | function |  |
| `validateUrl` | function |  |
| `validatePhoneNumber` | function |  |
| `validateNumberRange` | function |  |
| `validateStringLength` | function |  |
| `generateId` | function |  |
| `generateUUID` | function |  |
| `slugify` | function |  |
| `truncate` | function |  |
| `toCamelCase` | function |  |
| `toPascalCase` | function |  |
| `toSnakeCase` | function |  |
| `toKebabCase` | function |  |
| `capitalize` | function |  |
| `titleCase` | function |  |
| `sanitizeInput` | function | XSS prevention input sanitizer |
| `sanitizeTitle` | function |  |
| `sanitizeEmail` | function |  |
| `sanitizeName` | function |  |
| `escapeHtml` | function |  |
| `maskEmailForLog` | function |  |


## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)
- [`@hua-labs/hooks`](https://www.npmjs.com/package/@hua-labs/hooks)

## License

MIT — [HUA Labs](https://hua-labs.com)
