# hua-i18n-sdk

> **v1.2.0** - Simple and powerful internationalization SDK for React applications

[![npm version](https://badge.fury.io/js/hua-i18n-sdk.svg)](https://badge.fury.io/js/hua-i18n-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GitHub stars](https://img.shields.io/github/stars/HUA-Labs/i18n-sdk?style=social)](https://github.com/HUA-Labs/i18n-sdk)

**⭐ If this project helped you, please give it a star!**

## Key Features

- **Simple API**: Intuitive and easy-to-use interface
- **Beginner-friendly**: One-line setup with `withDefaultConfig()`
- **Type Safety**: Full TypeScript support
- **SSR Support**: Perfect compatibility with Next.js server components
- **Robust Error Handling**: Auto-retry, recovery strategies, user-friendly messages
- **Lightweight Bundle**: Optimized size with tree-shaking support
- **Real-time Language Switching**: Dynamic language switching support
- **Developer-friendly**: Debug mode, missing key display, detailed logging

## Installation

```bash
npm install hua-i18n-sdk
# or
yarn add hua-i18n-sdk
# or
pnpm add hua-i18n-sdk
```

## Quick Start

### 🚀 For Beginners (Recommended) - Easy Entry Point

```tsx
// Beginner-friendly entry point - start immediately without complex configuration!
import { withDefaultConfig, useTranslation } from 'hua-i18n-sdk/easy';

// One line setup! Start with default configuration
export const I18nProvider = withDefaultConfig();

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t, tWithParams } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{tWithParams('common.greeting', { name: 'John' })}</p>
    </div>
  );
}
```

### 🚀 For Beginners (Recommended) - Default Entry Point

```tsx
import { withDefaultConfig, useTranslation } from 'hua-i18n-sdk';

// One line setup! Start with default configuration
export const I18nProvider = withDefaultConfig();

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t, tWithParams } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{tWithParams('common.greeting', { name: 'John' })}</p>
    </div>
  );
}
```

### ⚙️ For Intermediate Users (Partial Customization)

```tsx
import { withDefaultConfig } from 'hua-i18n-sdk';

// Customize only what you need
export const I18nProvider = withDefaultConfig({
  defaultLanguage: 'en',
  namespaces: ['common', 'auth'],
  debug: true,
});
```

### 🔧 For Advanced Users (Full Customization)

```tsx
import { I18nProvider, useTranslation, createI18nConfig } from 'hua-i18n-sdk';

const i18nConfig = createI18nConfig({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  supportedLanguages: [
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ],
  namespaces: ['common', 'auth'],
  loadTranslations: async (language, namespace) => {
    const module = await import(`./translations/${language}/${namespace}.json`);
    return module.default;
  },
  // v1.1.0: Enhanced error handling
  errorHandling: {
    recoveryStrategy: {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2
    },
    logging: { enabled: true, level: 'error' },
    userFriendlyMessages: true
  }
});

function App() {
  return (
    <I18nProvider config={i18nConfig}>
      <MyComponent />
    </I18nProvider>
  );
}
```

## Translation File Structure

```text
translations/
├── ko/
│   ├── common.json
│   └── auth.json
└── en/
    ├── common.json
    └── auth.json
```

### Translation File Examples

```json
// translations/ko/common.json
{
  "welcome": "환영합니다",
  "greeting": "안녕하세요, {{name}}님!",
  "buttons": {
    "save": "저장",
    "cancel": "취소"
  }
}
```

```json
// translations/en/common.json
{
  "welcome": "Welcome",
  "greeting": "Hello, {{name}}!",
  "buttons": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

## withDefaultConfig() Options

```tsx
export const I18nProvider = withDefaultConfig({
  // Default language (default: 'ko')
  defaultLanguage: 'en',
  
  // Fallback language (default: 'en')
  fallbackLanguage: 'ko',
  
  // Namespaces (default: ['common'])
  namespaces: ['common', 'auth', 'dashboard'],
  
  // Debug mode (default: NODE_ENV === 'development')
  debug: true,
  
  // Auto language sync events (default: true)
  // Automatically registers event listeners: huaI18nLanguageChange, i18nLanguageChanged
  // Automatically detects browser language changes or external language switching events
  autoLanguageSync: true,
});
```

### autoLanguageSync Option Details

The `autoLanguageSync` option automatically detects and handles language switching events:

```tsx
// Events that are automatically detected
window.addEventListener('huaI18nLanguageChange', (event) => {
  // SDK internal language change event
  const newLanguage = event.detail;
});

window.addEventListener('i18nLanguageChanged', (event) => {
  // General language change event
  const newLanguage = event.detail;
});
```

**Usage Example:**

```tsx
// When changing language from other components
const changeLanguage = (language) => {
  // Event dispatch → withDefaultConfig() automatically detects
  window.dispatchEvent(new CustomEvent('i18nLanguageChanged', { 
    detail: language 
  }));
};
```

## Advanced Features

### Language Switching

```tsx
import { useLanguageChange } from 'hua-i18n-sdk';

function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguageChange();
  
  return (
    <select 
      value={currentLanguage} 
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {supportedLanguages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
}
```

### Server Components (SSR)

```tsx
import { ssrTranslate } from 'hua-i18n-sdk';

export default function ServerComponent() {
  const title = ssrTranslate({
    translations: translations.ko.common(),
    key: 'common.welcome',
    language: 'ko',
  });

  return <h1>{title}</h1>;
}
```

### Type-Safe Translations

```tsx
interface MyTranslations {
  common: {
    welcome: string;
    greeting: string;
  };
  auth: {
    login: string;
    logout: string;
  };
}

const { t } = useI18n<MyTranslations>();

// Autocomplete support
t('common.welcome'); // ✅ Type safe
t('common.invalid'); // ❌ Type error
```

## Error Handling (v1.1.0)

### Auto-retry and Recovery

```tsx
const config = {
  // ... basic config
  errorHandling: {
    recoveryStrategy: {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      shouldRetry: (error) => ['NETWORK_ERROR', 'LOAD_FAILED'].includes(error.code),
      onRetry: (error, attempt) => console.log(`Retry ${attempt}:`, error.message),
      onMaxRetriesExceeded: (error) => alert('Unable to load translation data')
    },
    logging: {
      enabled: true,
      level: 'error',
      includeStack: true,
      includeContext: true
    },
    userFriendlyMessages: true
  }
};
```

### Custom Error Handling

```tsx
import { createTranslationError, logTranslationError } from 'hua-i18n-sdk';

try {
  // Translation loading
} catch (error) {
  const translationError = createTranslationError(
    'LOAD_FAILED',
    error.message,
    error,
    { language: 'en', namespace: 'common' }
  );
  
  logTranslationError(translationError);
}
```

## Migration (v1.0.x → v1.1.0)

**✅ Existing code works without changes**

```tsx
// v1.0.x code (works as-is)
const config: I18nConfig = {
  defaultLanguage: 'en',
  fallbackLanguage: 'ko',
  supportedLanguages: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
  ],
  namespaces: ['common'],
  loadTranslations: async (language, namespace) => {
    const module = await import(`./translations/${language}/${namespace}.json`);
    return module.default;
  },
};

// Works identically in v1.1.0
```

### Utilizing New Features (Optional)

```tsx
// v1.1.0: Enhanced error handling (optional)
const config: I18nConfig = {
  // ... existing configuration
  errorHandling: {
    recoveryStrategy: {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2
    },
    logging: { enabled: true, level: 'error' },
    userFriendlyMessages: true
  }
};
```

## Documentation

- [SDK Reference](./docs/SDK_REFERENCE.md) - Complete API documentation
- [Changelog](./docs/CHANGELOG.md) - Version changes
- [Environment Guides](./docs/ENVIRONMENT_GUIDES.md) - Various environment setups
- [Environment Examples](./docs/ENVIRONMENT_EXAMPLES.md) - Environment-specific setup examples
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project

## Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Building

```bash
npm run build
```

## Contributing

If you'd like to contribute to the project, please refer to the [Contributing Guide](./CONTRIBUTING.md).

### Development Environment Setup

```bash
git clone https://github.com/HUA-Labs/i18n-sdk.git
cd hua-i18n-sdk
npm install
npm run dev
```

## License

This project is distributed under the [MIT License](./LICENSE).

## Acknowledgments

- [React](https://reactjs.org/) - Amazing UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Next.js](https://nextjs.org/) - SSR support
- Thanks to all contributors!

---

> **Made with ❤️ by the hua-i18n-sdk team**
