# @hua-labs/utils

Common utility functions for the hua-ux ecosystem.
hua-ux 생태계를 위한 공통 유틸리티 함수 모음입니다.

[![npm version](https://img.shields.io/npm/v/@hua-labs/utils.svg)](https://www.npmjs.com/package/@hua-labs/utils)
[![license](https://img.shields.io/npm/l/@hua-labs/utils.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

---

[English](#english) | [한국어](#korean)

## English

### Overview

A comprehensive utility library for the hua-ux ecosystem. Includes class name merging, formatters, performance utilities, validation, string manipulation, and sanitization functions.

### Installation

```bash
npm install @hua-labs/utils
# or
pnpm add @hua-labs/utils
```

### Available Utilities

#### Class Name Merging

```tsx
import { cn } from '@hua-labs/utils';

// Merge Tailwind CSS classes without conflicts
const className = cn(
  'px-4 py-2 bg-blue-500',
  isActive && 'bg-blue-700',
  'px-6' // Overrides px-4
);
// Result: 'py-2 bg-blue-700 px-6'
```

---

#### Formatters

```tsx
import { formatDate, formatNumber, formatFileSize, formatTimeAgo } from '@hua-labs/utils';

formatDate(new Date());           // "2026년 1월 11일"
formatNumber(1234567);            // "1,234,567"
formatFileSize(1024 * 1024);      // "1 MB"
formatTimeAgo(new Date('2026-01-10')); // "1일 전"
```

---

#### Performance Utilities

```tsx
import { debounce, throttle, memoize, delay, retry } from '@hua-labs/utils';

// Debounce - Execute after delay
const debouncedSearch = debounce(search, 300);

// Throttle - Execute at most once per interval
const throttledScroll = throttle(handleScroll, 100);

// Memoize - Cache function results
const memoizedFetch = memoize(fetchData);

// Delay - Promise-based timeout
await delay(1000);

// Retry - Retry failed operations
const result = await retry(fetchData, { maxAttempts: 3, delay: 1000 });
```

---

#### Validation

```tsx
import {
  validateEmail,
  validatePassword,
  validateUrl,
  validatePhoneNumber,
  validateNumberRange,
  validateStringLength
} from '@hua-labs/utils';

validateEmail('test@example.com');       // true
validatePassword('Secure123!');          // true
validateUrl('https://example.com');      // true
validatePhoneNumber('010-1234-5678');    // true
validateNumberRange(50, 0, 100);         // true
validateStringLength('hello', 1, 10);    // true
```

---

#### String Utilities

```tsx
import {
  generateId,
  generateUUID,
  slugify,
  truncate,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  capitalize,
  titleCase
} from '@hua-labs/utils';

generateId();                     // "abc123def..."
generateUUID();                   // "550e8400-e29b-41d4-a716-446655440000"
slugify('Hello World');           // "hello-world"
truncate('Long text...', 10);     // "Long te..."
toCamelCase('hello_world');       // "helloWorld"
toPascalCase('hello_world');      // "HelloWorld"
toSnakeCase('helloWorld');        // "hello_world"
toKebabCase('helloWorld');        // "hello-world"
capitalize('hello');              // "Hello"
titleCase('hello world');         // "Hello World"
```

---

#### Sanitization

```tsx
import {
  sanitizeInput,
  sanitizeTitle,
  sanitizeEmail,
  sanitizeName,
  escapeHtml,
  maskEmailForLog
} from '@hua-labs/utils';

sanitizeInput('<script>alert("xss")</script>');  // Removes dangerous tags
sanitizeTitle('  Hello World!  ');               // "Hello World!"
sanitizeEmail(' TEST@EXAMPLE.COM ');             // "test@example.com"
sanitizeName('  John Doe  ');                    // "John Doe"
escapeHtml('<div>Hello</div>');                  // "&lt;div&gt;Hello&lt;/div&gt;"
maskEmailForLog('test@example.com');             // "t***@e***.com"
```

---

### Requirements

- React >= 18.0.0 (peer dependency)

---

## Korean

### 개요

hua-ux 생태계를 위한 종합 유틸리티 라이브러리입니다. 클래스명 병합, 포맷터, 성능 유틸리티, 유효성 검사, 문자열 조작, 살균 함수를 포함합니다.

### 설치

```bash
npm install @hua-labs/utils
# 또는
pnpm add @hua-labs/utils
```

### 사용 가능한 유틸리티

#### 클래스명 병합

```tsx
import { cn } from '@hua-labs/utils';

// 충돌 없이 Tailwind CSS 클래스 병합
const className = cn(
  'px-4 py-2 bg-blue-500',
  isActive && 'bg-blue-700',
  'px-6' // px-4를 덮어씀
);
// 결과: 'py-2 bg-blue-700 px-6'
```

---

#### 포맷터

```tsx
import { formatDate, formatNumber, formatFileSize, formatTimeAgo } from '@hua-labs/utils';

formatDate(new Date());           // "2026년 1월 11일"
formatNumber(1234567);            // "1,234,567"
formatFileSize(1024 * 1024);      // "1 MB"
formatTimeAgo(new Date('2026-01-10')); // "1일 전"
```

---

#### 성능 유틸리티

```tsx
import { debounce, throttle, memoize, delay, retry } from '@hua-labs/utils';

// Debounce - 지연 후 실행
const debouncedSearch = debounce(search, 300);

// Throttle - 간격당 최대 1회 실행
const throttledScroll = throttle(handleScroll, 100);

// Memoize - 함수 결과 캐시
const memoizedFetch = memoize(fetchData);

// Delay - Promise 기반 타임아웃
await delay(1000);

// Retry - 실패한 작업 재시도
const result = await retry(fetchData, { maxAttempts: 3, delay: 1000 });
```

---

#### 유효성 검사

```tsx
import {
  validateEmail,
  validatePassword,
  validateUrl,
  validatePhoneNumber,
  validateNumberRange,
  validateStringLength
} from '@hua-labs/utils';

validateEmail('test@example.com');       // true
validatePassword('Secure123!');          // true
validateUrl('https://example.com');      // true
validatePhoneNumber('010-1234-5678');    // true
validateNumberRange(50, 0, 100);         // true
validateStringLength('hello', 1, 10);    // true
```

---

#### 문자열 유틸리티

```tsx
import {
  generateId,
  generateUUID,
  slugify,
  truncate,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  capitalize,
  titleCase
} from '@hua-labs/utils';

generateId();                     // "abc123def..."
generateUUID();                   // "550e8400-e29b-41d4-a716-446655440000"
slugify('Hello World');           // "hello-world"
truncate('Long text...', 10);     // "Long te..."
toCamelCase('hello_world');       // "helloWorld"
toPascalCase('hello_world');      // "HelloWorld"
toSnakeCase('helloWorld');        // "hello_world"
toKebabCase('helloWorld');        // "hello-world"
capitalize('hello');              // "Hello"
titleCase('hello world');         // "Hello World"
```

---

#### 살균 (Sanitization)

```tsx
import {
  sanitizeInput,
  sanitizeTitle,
  sanitizeEmail,
  sanitizeName,
  escapeHtml,
  maskEmailForLog
} from '@hua-labs/utils';

sanitizeInput('<script>alert("xss")</script>');  // 위험한 태그 제거
sanitizeTitle('  Hello World!  ');               // "Hello World!"
sanitizeEmail(' TEST@EXAMPLE.COM ');             // "test@example.com"
sanitizeName('  John Doe  ');                    // "John Doe"
escapeHtml('<div>Hello</div>');                  // "&lt;div&gt;Hello&lt;/div&gt;"
maskEmailForLog('test@example.com');             // "t***@e***.com"
```

---

### 요구사항

- React >= 18.0.0 (peer dependency)

---

## License

MIT License

## Repository

https://github.com/HUA-Labs/HUA-Labs-public
