# @hua-labs/i18n-core

## 2.0.5

### Patch Changes

- docs: update package READMEs and clean internal references

## 2.0.2

### Patch Changes

- Complete test coverage across all 16 packages (3,255 tests). Regenerate README.md and ai.yaml documentation for all packages. Fix docs-engine vitest compatibility.

## Unreleased

### Minor Changes

- **feat(i18n): tPlural — ICU plural support via Intl.PluralRules**

  - Add `tPlural(key, count, params?, language?)` to Translator, useI18n, useTranslation
  - Add `PluralCategory`, `PluralValue`, `isPluralValue` types and type guard
  - Add `ResolvePluralKey` conditional type for type-safe plural keys
  - Update `TranslationNamespace` to accept `PluralValue` objects
  - Update `generate-i18n-types.ts` to detect plural objects and emit `TranslationPluralKey`
  - Zero bundle cost — uses browser-native `Intl.PluralRules`
  - Supports all CLDR categories: zero, one, two, few, many, other
  - Fallback: plain string values still work (interpolates `{count}`)

## 1.1.0-alpha.3

### Patch Changes

- d997d6b: # npm Provenance & Documentation Improvements

  ## npm Provenance (출처증명)

  - Add npm provenance support for all packages
  - Configure `.npmrc` with `provenance=true`
  - Add `id-token: write` permission to release workflow
  - Enhance supply chain security with package attestations

  ## Documentation Enhancements

  - **Badges**: Standardize badges across all package READMEs

    - Add npm downloads badge to all packages
    - Add TypeScript badge to all packages
    - Ensure consistent badge formatting

  - **Bilingual Support**: Improve Korean-English navigation
    - Add language navigation links to all READMEs
    - Format: `[English](#english) | [한국어](#korean)`
    - Maintain consistent bilingual structure

  ## Affected Packages

  All 9 packages receive patch updates for documentation and provenance:

  - @hua-labs/hua-ux
  - @hua-labs/ui
  - @hua-labs/motion-core
  - @hua-labs/i18n-core
  - @hua-labs/i18n-core-zustand
  - @hua-labs/i18n-loaders
  - @hua-labs/i18n-beginner
  - @hua-labs/state
  - create-hua-ux

## 1.1.0-alpha.2

### Patch Changes

- f7d08f1: chore: align external dependency versions across all packages

  - Introduce syncpack for automated dependency version management
  - Align @types/node to ^25.0.3 across all packages
  - Align TypeScript to ^5.9.3 across all packages
  - Align React ecosystem packages to consistent versions
  - Add dependency management scripts: deps:check, deps:fix, deps:format

  This ensures consistent behavior across the monorepo and prevents version conflicts.

## 1.1.0-alpha.1

### Minor Changes

- Public alpha release with complete documentation

  - Complete README standardization across all packages
  - Comprehensive DETAILED_GUIDE documentation for each package
  - Optimized npm keywords for better discoverability
  - Professional documentation tone and structure
  - All packages updated to alpha.0.2

## 2.0.0

### Major Changes

- a475818: Initial release of i18n packages:

  - **@hua-labs/i18n-core**: Core i18n library with SSR/CSR support, zero flickering on language changes, and state management integration
  - **@hua-labs/i18n-core-zustand**: Zustand adapter for seamless state management integration
  - **@hua-labs/i18n-loaders**: Production-ready translation loaders with caching, preloading, and default translation merging

  Includes complete Next.js App Router example and CodeSandbox template.

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
