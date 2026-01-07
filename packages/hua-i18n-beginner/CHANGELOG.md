# @hua-labs/i18n-beginner

## 2.1.0-alpha.4

### Minor Changes

- dd9d4b2: Release alpha versions of i18n packages with React 19 support and type safety improvements.

  - @hua-labs/i18n-core-zustand: 2.0.0-alpha.3 (major bump due to Zustand v5 breaking changes)
  - @hua-labs/i18n-beginner: 2.1.0-alpha.3
  - @hua-labs/i18n-loaders: 1.1.0-alpha.3

  Note: i18n-core-zustand requires major bump as it has breaking changes (Zustand v5 upgrade) as documented in CHANGELOG.

## 2.1.0-alpha.3

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

## 2.1.0-alpha.2

### Patch Changes

- f7d08f1: chore: align external dependency versions across all packages

  - Introduce syncpack for automated dependency version management
  - Align @types/node to ^25.0.3 across all packages
  - Align TypeScript to ^5.9.3 across all packages
  - Align React ecosystem packages to consistent versions
  - Add dependency management scripts: deps:check, deps:fix, deps:format

  This ensures consistent behavior across the monorepo and prevents version conflicts.

## 2.1.0-alpha.1

### Minor Changes

- Public alpha release with complete documentation

  - Complete README standardization across all packages
  - Comprehensive DETAILED_GUIDE documentation for each package
  - Optimized npm keywords for better discoverability
  - Professional documentation tone and structure
  - All packages updated to alpha.0.2

## 2.0.0

### Major Changes

- 901ff69: Initial release of HUA i18n Beginner SDK

  - Simple i18n SDK for React beginners
  - Korean/English support out of the box
  - Easy language addition with TypeScript files
  - Next.js App Router and Pages Router compatible
  - Zero configuration setup
  - 80+ built-in translations
