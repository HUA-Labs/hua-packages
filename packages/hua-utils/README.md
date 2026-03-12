# @hua-labs/utils

A comprehensive utility library for the hua ecosystem. Includes class name merging (Tailwind-safe), formatters, performance utilities, validation, string manipulation, and sanitization functions.

[![npm version](https://img.shields.io/npm/v/@hua-labs/utils.svg)](https://www.npmjs.com/package/@hua-labs/utils)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/utils.svg)](https://www.npmjs.com/package/@hua-labs/utils)
[![license](https://img.shields.io/npm/l/@hua-labs/utils.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
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
| `formatDate` | function | Format a Date or date string using Intl.DateTimeFormat with ko-KR locale. Accepts optional Intl.DateTimeFormatOptions. |
| `formatNumber` | function | Format a number using Intl.NumberFormat with ko-KR locale. Accepts optional Intl.NumberFormatOptions. |
| `formatFileSize` | function | Convert a byte count into a human-readable string (e.g. '1.5 MB'). |
| `formatTimeAgo` | function | Return a Korean relative time string for a past date (e.g. '3분 전', '2일 전'). |
| `debounce` | function | Debounce function calls with configurable delay |
| `throttle` | function | Throttle function calls to execute at most once per interval. |
| `memoize` | function | Cache function results by argument key. Accepts optional resolver to compute the cache key. |
| `delay` | function | Return a Promise that resolves after the given number of milliseconds. |
| `retry` | function | Retry an async function up to maxAttempts times with exponential back-off between attempts. |
| `validateEmail` | function | Email format validation |
| `validatePassword` | function | Validate a password against configurable rules (minLength, uppercase, lowercase, numbers, special chars). Returns { isValid, errors }. |
| `validateUrl` | function | Return true if the string is a valid absolute URL (uses URL constructor). |
| `validatePhoneNumber` | function | Validate a Korean mobile phone number (01x-xxxx-xxxx format). |
| `validateNumberRange` | function | Return true if a number is within the inclusive [min, max] range. |
| `validateStringLength` | function | Return true if a string length is within the inclusive [min, max] range. |
| `generateId` | function | Generate a unique ID string with optional prefix (default: 'id'). Uses Date.now + random suffix. |
| `generateUUID` | function | Generate a random UUID v4 string. |
| `slugify` | function | Convert a string into a URL-friendly slug (lowercase, hyphens, no special chars). |
| `truncate` | function | Truncate a string to the given length and append a suffix (default: '...'). Handles multi-byte characters. |
| `toCamelCase` | function | Convert a string to camelCase. |
| `toPascalCase` | function | Convert a string to PascalCase. |
| `toSnakeCase` | function | Convert a string to snake_case. |
| `toKebabCase` | function | Convert a string to kebab-case. |
| `capitalize` | function | Capitalize the first character and lowercase the rest of a string. |
| `titleCase` | function | Capitalize the first character of every word in a string. |
| `sanitizeInput` | function | XSS prevention input sanitizer |
| `sanitizeTitle` | function | Sanitize a title string — removes HTML tags and dangerous patterns, enforces optional maxLength (default: 100). |
| `sanitizeEmail` | function | Sanitize an email address — trims whitespace and lowercases. |
| `sanitizeName` | function | Sanitize a name string — removes HTML tags and XSS patterns. |
| `escapeHtml` | function | Escape HTML special characters (&, <, >, ", '). Intended for email body rendering, not general React output. |
| `maskEmailForLog` | function | Mask an email address for safe logging (GDPR/CCPA). Shows only the first N local-part characters (default: 3), e.g. 'use***@***'. |

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)
- [`@hua-labs/hooks`](https://www.npmjs.com/package/@hua-labs/hooks)

## License

MIT — [HUA Labs](https://hua-labs.com)
