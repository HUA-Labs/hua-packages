# @hua-labs/utils

Common utility functions for the hua ecosystem.
hua 생태계를 위한 공통 유틸리티 함수 모음.

[![npm version](https://img.shields.io/npm/v/@hua-labs/utils.svg)](https://www.npmjs.com/package/@hua-labs/utils)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/utils.svg)](https://www.npmjs.com/package/@hua-labs/utils)
[![license](https://img.shields.io/npm/l/@hua-labs/utils.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

> **Alpha**: APIs may change before stable release. | **알파**: 안정 릴리스 전 API가 변경될 수 있습니다.

## Overview | 개요

A comprehensive utility library for the hua ecosystem. Includes class name merging (Tailwind-safe), formatters, performance utilities, validation, string manipulation, and sanitization functions.

hua 생태계를 위한 종합 유틸리티 라이브러리입니다. Tailwind 클래스 병합, 포맷터, 성능 유틸리티, 유효성 검사, 문자열 조작, 살균 함수를 포함합니다.

## Features

- **`cn()` class merging** — Tailwind-safe class name merging via clsx + tailwind-merge
- **Formatters** — Date, number, file size, relative time
- **Performance** — `debounce`, `throttle`, `memoize`, `delay`, `retry`
- **Validation** — Email, password, URL, phone number, range checks
- **String utils** — UUID, slugify, truncate, case conversion (camel/pascal/snake/kebab)
- **Sanitization** — XSS prevention, HTML escaping, email masking

## Installation | 설치

```bash
pnpm add @hua-labs/utils
```

Peer dependency: `react >= 19.0.0`

## Quick Start | 빠른 시작

```tsx
import { cn, formatTimeAgo, debounce, validateEmail, sanitizeInput } from '@hua-labs/utils';

// Tailwind class merging
const cls = cn('px-4 py-2 bg-blue-500', isActive && 'bg-blue-700', 'px-6');

// Formatting
formatTimeAgo(new Date('2026-02-07')); // "1일 전"

// Performance
const debouncedSearch = debounce(search, 300);

// Validation & sanitization
validateEmail('test@example.com'); // true
sanitizeInput('<script>alert("xss")</script>'); // safe string
```

## API Overview | API 개요

| Category | Functions |
|----------|-----------|
| Class names | `cn` |
| Formatters | `formatDate`, `formatNumber`, `formatFileSize`, `formatTimeAgo` |
| Performance | `debounce`, `throttle`, `memoize`, `delay`, `retry` |
| Validation | `validateEmail`, `validatePassword`, `validateUrl`, `validatePhoneNumber`, `validateNumberRange`, `validateStringLength` |
| Strings | `generateId`, `generateUUID`, `slugify`, `truncate`, `toCamelCase`, `toPascalCase`, `toSnakeCase`, `toKebabCase`, `capitalize`, `titleCase` |
| Sanitization | `sanitizeInput`, `sanitizeTitle`, `sanitizeEmail`, `sanitizeName`, `escapeHtml`, `maskEmailForLog` |

## Documentation | 문서

- [📚 Documentation Site | 문서 사이트](https://docs.hua-labs.com)

## Related Packages | 관련 패키지

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua) — UX framework (re-exports these utils)
- [`@hua-labs/hooks`](https://www.npmjs.com/package/@hua-labs/hooks) — React hooks collection

## Requirements | 요구사항

React >= 19.0.0 · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
