# @hua-labs/state

## 1.0.2

### Patch Changes

- docs: update package READMEs and clean internal references

## 1.0.1

### Patch Changes

- Complete test coverage across all 16 packages (3,255 tests). Regenerate README.md and ai.yaml documentation for all packages. Fix docs-engine vitest compatibility.

## 1.0.0-alpha.5

### Patch Changes

- Updated dependencies [dd9d4b2]
  - @hua-labs/i18n-core-zustand@2.0.0-alpha.4

## 0.1.0-alpha.4

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

- Updated dependencies [d997d6b]
  - @hua-labs/i18n-core-zustand@1.1.0-alpha.3

## 0.1.0-alpha.3

### Patch Changes

- f7d08f1: chore: align external dependency versions across all packages

  - Introduce syncpack for automated dependency version management
  - Align @types/node to ^25.0.3 across all packages
  - Align TypeScript to ^5.9.3 across all packages
  - Align React ecosystem packages to consistent versions
  - Add dependency management scripts: deps:check, deps:fix, deps:format

  This ensures consistent behavior across the monorepo and prevents version conflicts.

- f7d08f1: fix(hua-ux, state): improve type safety and remove 'as any' assertions

  - Remove all 'as any' type assertions from hua-ux framework
  - Export zustand types (UseBoundStore, StoreApi) from @hua-labs/state for proper type inference
  - Fix LicenseFeature type handling for dynamic plugin features
  - Improve type safety in Providers.tsx by using re-exported types

- Updated dependencies [f7d08f1]
- Updated dependencies [f7d08f1]
  - @hua-labs/i18n-core-zustand@1.1.0-alpha.2

## 0.1.0-alpha.2

### Patch Changes

- a1aa8e9: fix: Fix package.json exports to use dist instead of src

  Fixed exports configuration in @hua-labs/state and @hua-labs/ui:

  - Changed all import/require paths from src/_.ts to dist/_.js
  - Fixed module field to point to dist/_.js instead of dist/_.mjs
  - This resolves "Module not found" and "Missing module type" errors in Next.js projects

  Affected packages:

  - @hua-labs/state: Fixed main entry and integrations/i18n exports
  - @hua-labs/ui: Fixed main entry and all subpath exports (advanced, form, navigation, feedback, components)

## 0.1.0-alpha.1

### Minor Changes

- Public alpha release with complete documentation

  - Complete README standardization across all packages
  - Comprehensive DETAILED_GUIDE documentation for each package
  - Optimized npm keywords for better discoverability
  - Professional documentation tone and structure
  - All packages updated to alpha.0.2

## 0.1.0-alpha.0.1

### Minor Changes

- 31920d5: Introduce unified state management package with SSR support

  - Zustand v5 based state management
  - SSR support for Next.js App Router
  - i18n integration store included
  - Type-safe with full TypeScript support
  - Lightweight and performant
