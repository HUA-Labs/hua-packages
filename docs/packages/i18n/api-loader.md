# API Loader Guide

## Overview

`createApiTranslationLoader` is a function that creates an API-based translation loader. It provides production-tested loading strategies.

## Key Features

### 1. Caching

- **TTL Cache**: Each translation is cached for a specified duration (default: 5 minutes)
- **Duplicate Request Prevention**: Reuses existing Promise if the same translation is loading
- **Global Cache**: Same loader instance shares cache across all components

### 2. Retry Mechanism

Automatically retries on network errors.

#### Retryable Errors

- **Network errors**: `TypeError`, `Failed to fetch`, `NetworkError`
- **Server errors**: HTTP 5xx status codes
- **Timeout**: HTTP 408 status code

#### Retry Strategy

- **Exponential backoff**: Delay time doubles with each retry
- **Retry count**: Configurable via `retryCount` option (default: 0, no retry)
- **Retry delay**: Configurable base delay via `retryDelay` option (default: 1000ms)

```typescript
const loader = createApiTranslationLoader({
  retryCount: 3,        // Retry up to 3 times
  retryDelay: 1000,     // 1s, 2s, 4s intervals
});
```

### 3. Enhanced Error Handling

#### Error Type Classification

```typescript
function isRetryableError(error: unknown): boolean {
  // Network error
  if (error instanceof TypeError) {
    return true;
  }

  // Fetch API error messages
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('failed to fetch') ||
        message.includes('networkerror')) {
      return true;
    }
  }

  // HTTP status code check
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    // 5xx server errors or 408 timeout
    if ((status >= 500 && status < 600) || status === 408) {
      return true;
    }
  }

  return false;
}
```

## Usage Examples

### Basic Usage

```typescript
import { createApiTranslationLoader } from '@hua-labs/i18n-loaders';

const loader = createApiTranslationLoader({
  translationApiPath: '/api/translations'
});
```

### Retry Configuration

```typescript
const loader = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  retryCount: 3,        // Retry up to 3 times
  retryDelay: 1000,     // 1s base delay (exponential backoff)
});
```

### Custom Request Options

```typescript
const loader = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  requestInit: {
    headers: {
      'Authorization': 'Bearer token',
      'X-Custom-Header': 'value'
    }
  }
});
```

### Dynamic Request Options

```typescript
const loader = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  requestInit: (language, namespace) => ({
    headers: {
      'X-Language': language,
      'X-Namespace': namespace
    }
  })
});
```

### Server-Side Usage

```typescript
const loader = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  baseUrl: 'https://api.example.com',  // For server-side use
  localFallbackBaseUrl: 'http://localhost:3000'  // Development fallback
});
```

## Performance Optimization

### Cache TTL Adjustment

```typescript
const loader = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 10 * 60 * 1000,  // 10 minute cache
});
```

### Disable Cache

```typescript
const loader = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  disableCache: true  // Disable cache (for development)
});
```

## Error Handling

### Retry Logs

When retries occur, the following logs are output:

```
[i18n-loaders] Translation fetch failed (attempt 1/4), retrying...
[i18n-loaders] Translation fetch failed (attempt 2/4), retrying...
[i18n-loaders] Translation fetch failed (attempt 3/4), retrying...
[i18n-loaders] translation fetch failed
```

### Final Failure Handling

If all retries fail, an error is thrown. You can use `withDefaultTranslations` to fallback to default translations.

```typescript
import { createApiTranslationLoader, withDefaultTranslations } from '@hua-labs/i18n-loaders';

const apiLoader = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  retryCount: 3
});

const defaultTranslations = {
  ko: { common: { welcome: '환영합니다' } },
  en: { common: { welcome: 'Welcome' } }
};

// Use default translations if API fails
const loader = withDefaultTranslations(apiLoader, defaultTranslations);
```

### Empty Object Response Handling

When API returns an empty object `{}`, `withDefaultTranslations` automatically falls back to default translations:

```typescript
// API returns {} -> falls back to default translations
// API returns null/undefined -> falls back to default translations
// API returns valid data -> merges with default translations
```

## Monitoring

### Custom Logger

```typescript
const customLogger = {
  log: (message: string, ...args: unknown[]) => {
    // Custom logging logic
  },
  warn: (message: string, ...args: unknown[]) => {
    // Warning logging
  },
  error: (message: string, ...args: unknown[]) => {
    // Error logging
  }
};

const loader = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  logger: customLogger
});
```

## Testing

### Custom Fetcher

You can use a custom fetcher in test environments:

```typescript
const mockFetcher = async (url: string) => {
  // Return mock response
  return new Response(JSON.stringify({ welcome: 'Welcome' }));
};

const loader = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  fetcher: mockFetcher
});
```
