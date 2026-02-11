# @hua-labs/i18n-loaders Detailed Guide

Production-ready loading and caching strategies.

---

## API Translation Loader

`createApiTranslationLoader` provides high-performance fetching with built-in optimizations.

#### Configuration

```ts
const loader = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 300_000,        // 5 minutes cache
  retryCount: 3,               // Retry on network errors
  retryDelay: 1000,            // Exponential backoff start
  autoInvalidateInDev: true,   // Auto-invalidate on window focus (dev only)
});
```

#### Full ApiLoaderOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `translationApiPath` | `string` | `'/api/translations'` | API endpoint path |
| `cacheTtlMs` | `number` | `300000` | Cache TTL in ms |
| `disableCache` | `boolean` | `false` | Disable caching entirely |
| `retryCount` | `number` | `0` | Retry attempts on transient failures |
| `retryDelay` | `number` | `1000` | Initial retry delay (exponential backoff) |
| `autoInvalidateInDev` | `boolean` | `true` (dev) | Auto-invalidate cache on focus |
| `fetcher` | `(url, init) => Promise<Response>` | `fetch` | Custom fetch function |
| `baseUrl` | `string` | auto-detected | Base URL for SSR |
| `localFallbackBaseUrl` | `string` | `'http://localhost:3000'` | Local dev fallback |
| `requestInit` | `RequestInit \| (lang, ns) => RequestInit` | — | Custom request options |
| `logger` | `Pick<Console, 'log'\|'warn'\|'error'>` | `console` | Logger instance |

#### Return Type

`createApiTranslationLoader` returns a `TranslationLoader` function with attached methods:

```ts
const loader = createApiTranslationLoader({ ... });

// Use as loader
loader('ko', 'common');  // => Promise<TranslationRecord>

// Cache management methods
loader.invalidate('ko', 'common');  // Invalidate specific entry
loader.invalidate('ko');            // Invalidate all for language
loader.invalidate();                // Invalidate everything
loader.clear();                     // Clear all cache
```

### Optimization Techniques

#### 1. Preloading Namespaces

Fetch data before the user navigates.

```ts
// preloadNamespaces(language, namespaces, loader, options?)
const result = await preloadNamespaces('ko', ['dashboard', 'profile'], loader);
// result: { fulfilled: ['dashboard', 'profile'], rejected: [] }
```

#### 2. Warming Fallback Languages

Pre-fetch fallback languages to prevent delays. Skips `currentLanguage`.

```ts
// warmFallbackLanguages(currentLanguage, languages, namespaces, loader, options?)
await warmFallbackLanguages('ko', ['ko', 'en', 'ja'], ['common'], loader);
// Only warms 'en' and 'ja' (skips 'ko' since it's currentLanguage)
```

#### 3. Default Translation Merging

Merge static defaults with dynamic API data.

```ts
const loader = withDefaultTranslations(apiLoader, {
  ko: { common: { welcome: '환영' } }
});
```

### SSR URL Resolution

The loader auto-detects the base URL for server-side requests:
1. `options.baseUrl` (highest priority)
2. `process.env.NEXT_PUBLIC_SITE_URL`
3. `process.env.VERCEL_URL`
4. `options.localFallbackBaseUrl` (default: `http://localhost:3000`)
