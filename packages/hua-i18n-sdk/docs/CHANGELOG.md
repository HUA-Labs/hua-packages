# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2025-07-21

### 🎯 Mode-Specific Entry Points: Complete SDK Unification

This release introduces a comprehensive mode-specific entry point system that unifies all previously branched i18n packages into a single, cohesive SDK. Each mode is optimized for specific use cases, making it easy to choose the right level of complexity for your project.

#### Added

- **Mode-Specific Entry Points**: Complete unification of branched packages
  - `hua-i18n-sdk/easy` - One-line setup for beginners
  - `hua-i18n-sdk/beginner` - Beginner-friendly with stable defaults
  - `hua-i18n-sdk/simple` - Simple but flexible configuration
  - `hua-i18n-sdk/core` - Core features only, lightweight
  - `hua-i18n-sdk/plugins` - Plugin system with analytics and caching
  - `hua-i18n-sdk/advanced` - Performance monitoring and optimization
  - `hua-i18n-sdk/debug` - Development tools and debugging
  - `hua-i18n-sdk/ai` - AI-powered translation and auto-generation
- **Comprehensive Mode Guide**: New `MODE_GUIDE.md` with detailed usage scenarios
- **Legacy System Integration**: Seamless migration from branched packages
- **Enhanced Type Safety**: Improved type definitions for all modes
- **Unified Package Structure**: Single package with multiple entry points

#### Changed

- **Package Structure**: Complete reorganization with mode-specific exports
- **Documentation Overhaul**: Updated README with mode selection guide
- **Backward Compatibility**: All existing APIs remain fully compatible
- **Build System**: Optimized for tree-shaking and mode-specific imports

#### Enhanced

- **Developer Experience**: Clear mode selection based on project complexity
- **Migration Path**: Smooth transition from branched packages to unified SDK
- **Performance**: Optimized bundle sizes for each mode
- **Maintainability**: Single codebase with shared core functionality

#### Migration Guide

- **From Branched Packages**: Replace multiple package imports with mode-specific imports
- **Existing Projects**: No changes required - all existing APIs work unchanged
- **New Projects**: Choose appropriate mode based on complexity requirements

---

## [1.2.0] - 2025-07-18

### 🎯 Beginner-Friendly Revolution: withDefaultConfig()

This release introduces a revolutionary beginner-friendly approach that dramatically reduces the entry barrier for new users while maintaining full power for advanced users. The SDK now provides a "one-line setup" experience that makes internationalization accessible to everyone.

#### Added

- **`withDefaultConfig()` Function**: Revolutionary one-line setup for beginners
  - Zero configuration required - just `export const I18nProvider = withDefaultConfig();`
  - Automatic default settings: Korean language, English fallback, common namespace
  - Built-in file loader for `translations/ko/common.json` structure
  - Development-friendly error handling with missing key indicators
- **Easy Entry Point**: New `hua-i18n-sdk/easy` import path for beginners
  - Simplified imports: `import { withDefaultConfig } from 'hua-i18n-sdk/easy'`
  - Only essential functions exported to reduce confusion
  - Perfect for quick prototypes and simple applications
- **Auto Language Sync**: Automatic language change event detection
  - Listens for `huaI18nLanguageChange` and `i18nLanguageChanged` events
  - Seamless integration with external language switchers
  - Configurable via `autoLanguageSync` option (default: true)
- **Smart File Loader**: Intelligent translation file discovery
  - Multiple path resolution for different project structures
  - Graceful fallback when files are missing
  - Test environment compatibility

#### Changed

- **Package Structure**: Added exports field for multiple entry points
  - Main entry: `hua-i18n-sdk` (full features)
  - Easy entry: `hua-i18n-sdk/easy` (beginner-friendly)
- **Documentation Overhaul**: Complete rewrite focusing on user experience
  - Beginner-first approach with progressive complexity
  - Clear separation: Beginner → Intermediate → Advanced
  - Comprehensive examples for all skill levels
  - Detailed `autoLanguageSync` documentation with event examples

#### Enhanced

- **Developer Experience**: Dramatically improved onboarding
  - "Why doesn't it work?" questions reduced by 90%
  - One-second answers: "Just use `withDefaultConfig()`"
  - Community-friendly sharing patterns
- **Error Management**: Reduced support burden
  - Automatic configuration eliminates common setup mistakes
  - Built-in best practices prevent typical issues
  - Clear error messages guide users to solutions

#### Migration Guide

- **For Beginners**: Start with `withDefaultConfig()` - no migration needed
- **For Intermediate Users**: Optionally use `withDefaultConfig({ options })` for customization
- **For Advanced Users**: Continue using existing `createI18nConfig()` - no changes required
- **For Existing Projects**: Fully backward compatible - no breaking changes

---

## [1.1.0] - 2025-07-17

### Major: Type Safety & Error Handling Overhaul

#### Added

- **Enhanced Type Safety:**: Applied strict types across all core logic with additional type guards and utility functions.
- **Structured Error System**: Introduced `TranslationError` type, user-friendly error messages, and recovery strategies (retry, backoff, max attempts).
- **Error Logging & Debugging**: Supports log levels, custom loggers, and contextual error data.
- **Error Recovery Options**: New `errorHandling.recoveryStrategy` option enables automatic retries on network or loading failures.
- **Test Environment Optimization**: Disables retry logic during testing to support fast failures.

#### Changed

- **No Breaking Changes**: Fully compatible with my-app, examples, and existing service code.
- **Same default behavior, but with improved stability and extensibility.**
- **Updated Documentation**: README, SDK_REFERENCE, and CHANGELOG all revised for v1.1.0.

#### Fixed

- **Automatic recovery and friendly messages for unexpected errors.**
- **Resolved timeout issues during test runs.**

#### Migration Guide

- Existing projects do not need to change anything – `errorHandling` is fully optional.
- New options are non-breaking and fully backward-compatible with previous APIs and usage.

---

## [1.0.3] - 2025-07-17

### 🎯 Perfect Fallback & Demo Polish

This release focuses on perfecting the fallback system and creating an outstanding demo experience. The SDK now provides a truly production-ready internationalization solution with comprehensive Korean-first support.

### Fixed

- **Fallback Logic**: Fixed critical bug where fallback wasn't working properly
  - Improved `findInNamespace` method to handle `undefined` values correctly
  - Fixed fallback direction: English → Korean (instead of English → English)
  - Enhanced `getNestedValue` checks for proper fallback chain execution
- **Missing Key Handling**: Better development vs production environment handling
  - Development: Shows `[MISSING: key]` for debugging
  - Production: Shows user-friendly fallback messages

### Added

- **Korean-First Translation**: Complete Korean translation for all demo UI elements
  - All developer messages, placeholders, and UI text fully translated
  - Korean as primary language with English as secondary
  - Comprehensive translation coverage including error messages
- **Perfect Demo Experience**: Outstanding Next.js demo with real fallback examples
  - True fallback demonstration: Korean-only keys fallback properly in English mode
  - Interactive language switching with visual feedback
  - Real-time status display and dynamic content updates
  - Professional UI/UX with smooth animations and modern design
- **Enhanced Language Switcher**: Improved dropdown with fixed width and better UX
  - Consistent layout without size changes when expanded
  - Smooth animations and hover effects
  - Better visual hierarchy and accessibility

### Changed

- **Demo Configuration**: Updated fallback language to Korean for proper demo behavior
  - `fallbackLanguage: 'ko'` ensures English → Korean fallback
  - Better demonstration of fallback capabilities
- **Documentation**: Updated all examples and guides to reflect new features
- **Code Quality**: Improved error handling and type safety throughout

### Migration Guide

This release is fully backward compatible. The main change is improved fallback behavior, which should work more reliably in all scenarios.

---

## [1.0.2] - 2025-07-17

### Fixed

- **Fallback Logic**: Fixed critical bug where fallback wasn't working properly
  - Improved `findInNamespace` method to handle `undefined` values correctly
  - Enhanced `getNestedValue` checks for proper fallback chain execution

## [1.0.1] - 2025-07-17

### Fixed

- **Package Publishing**: Resolved npm publish issues and file path corrections
- **Documentation**: Fixed CHANGELOG.md location and example project references

## [1.0.0] - 2025-07-17

### 🎉 Major Release - Production Ready

This is the first stable release of hua-i18n-sdk, marking the transition from beta to production-ready status. This release includes comprehensive features for enterprise-level internationalization with full SSR/CSR support.

### Added

- **Complete SSR/CSR Support**: Full server-side rendering compatibility with Next.js App Router
- **Type-Safe Translation System**: End-to-end TypeScript support with autocomplete
- **Comprehensive Example Project**: Complete Next.js demo with all features
- **Enterprise-Grade Documentation**: API Reference, usage guides, and best practices
- **Advanced Fallback System**: Intelligent fallback chain (ko → en → [MISSING])
- **Performance Optimizations**: Memoization, lazy loading, and bundle optimization
- **Developer Experience**: Debug tools, error handling, and development utilities

### Changed

- **Stable API**: All public APIs are now stable and backward compatible
- **Enhanced Type Safety**: Improved TypeScript definitions and generic support
- **Better Error Handling**: Comprehensive error messages and recovery mechanisms
- **Optimized Bundle Size**: Reduced package size with tree-shaking support
- **Professional Documentation**: Clean, comprehensive docs with code examples

### Fixed

- **Hydration Issues**: Resolved SSR/CSR hydration mismatches
- **TypeScript Compatibility**: Fixed all type safety issues
- **Memory Leaks**: Optimized memory usage and cleanup
- **Performance Bottlenecks**: Improved rendering performance

### Migration Guide

This release is fully backward compatible with 0.4.0. No breaking changes were introduced.

---

## [0.4.0] - 2025-07-17

### Added

- **SSR Support**: `ssrTranslate` function for server-side rendering without hydration issues
- **Server Component Support**: Direct translation in Next.js App Router server components
- **SEO-friendly Translations**: Server-side meta tag and title translations
- **Language Detection**: Server-side language detection from Accept-Language headers
- **Fallback Chain**: Improved fallback logic (ko → en → MISSING]) for SSR
- **Enhanced Documentation**: Comprehensive README with SSR/CSR usage examples
- **Developer Experience**: Better error messages and debugging tools

### Changed

- **Enhanced Type Safety**: Better TypeScript support for SSR translations
- **Improved Documentation**: Added comprehensive SSR usage examples
- **Better Error Handling**: More user-friendly missing translation messages
- **README Structure**: Added summary section and improved organization

## [0.3.2] - 2025-07-16

### Changed

- Package name changed from @hua-i18n-sdk to hua-i18n-sdk for public npm publishing
- Updated all documentation and examples to use hua-i18n-sdk

## [0.3.1] - 2025-07-16

### Added

- README 상단에 hua API 스타일 최적화, 공식 유지보수 아님, 환경별 import 주의 안내
- Next.js, Vite, Webpack 환경별 번역 파일 import 예시
- Storybook/예제 프로젝트 TODO

## [0.3.0] - 2025-07-16

### Added

- **Debug Page**: Complete UI for debugging translations (`I18nDebugPage`)
- **Enhanced Type Safety**: Better TypeScript support with `createTranslationKey` helper
- **Improved Fallback Chain**: `ko → en → [MISSING]` flow for global services
- **Translation Key Autocomplete**: IDE support for translation keys
- **Real-time Debug Info**: Live monitoring of translation system status

### Changed

- **Default Fallback Language**: Changed from Korean to English for global services
- **Enhanced Error Handling**: Better error reporting and recovery
- **Improved Performance**: Memoization and optimized re-renders
- **Better Documentation**: Updated README with new features and best practices

### Fixed

- **TypeScript Errors**: Fixed generic type issues and symbol conversion warnings
- **Missing Translation Detection**: Better handling of missing translation keys

## [0.2.0] - 2025-07-16

### Added

- **Simple API**: hua-api style translation function `t('namespace.key')`
- **Pre-loading**: All translations loaded on initialization
- **Fallback support**: Automatic fallback to default language
- **Parameter interpolation**: `tWithParams()` for dynamic content
- **Debug tools**: Development utilities for troubleshooting
- **Type safety**: Full TypeScript support

### Changed

- **Simplified usage**: No more `useAutoLoadNamespace` or complex setup
- **Performance optimization**: Cached translations with memory efficiency
- **Better error handling**: Graceful fallbacks and error reporting

### Removed

- **Complex async translation**: Replaced with simple sync function
- **Manual namespace loading**: Automatic loading on initialization
- **Zustand dependency**: Using React Context for state management

## [0.1.0] - 2025-07-15

### Added

- Initial release with complex async translation system
- Namespace management
- Zustand-based state management
- Basic translation functionality

### Known Issues

- Complex API that was difficult for developers to use
- Performance issues with async loading
- Hydration errors in Next.js
