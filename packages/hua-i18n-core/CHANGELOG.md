# @hua-labs/i18n-core

## 1.1.0

### Features

- **Server-side support for API loader**: The default API loader now supports server-side rendering
  - Added `baseUrl` option for explicit server-side base URL
  - Added `localFallbackBaseUrl` option for local development fallback
  - Automatic environment variable detection (`NEXT_PUBLIC_SITE_URL`, `VERCEL_URL`)
  - Works seamlessly on both server and client without additional configuration

## 1.0.0

### Major Changes

- Initial release of @hua-labs/i18n-core

  - Type-safe i18n library with SSR/CSR support
  - Zero flickering on language changes
  - Built-in hydration handling
  - State management integration support
  - Framework agnostic (Next.js, Remix, Vite, etc.)
  - Small bundle size (~2.8KB gzipped)
  - Zero dependencies (React only)

