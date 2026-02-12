# @hua-labs/motion-core

## 2.2.1

### Patch Changes

- Complete test coverage across all 16 packages (3,255 tests). Regenerate README.md and ai.yaml documentation for all packages. Fix docs-engine vitest compatibility.

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

## 1.1.0

### Minor Changes

- 31920d5: Update motion-core with latest hooks and improvements

  - Added `useUnifiedMotion` hook for streamlined animation API
  - Enhanced type definitions for better TypeScript support
  - Improved animation performance and stability
  - Updated documentation and examples

## 2.0.0

### Major Changes

- 950a40d: # HUA Motion Core v2.0.0 - React 19 compatibility and essential motion hooks

  **React 19 Migration:**

  - Updated peerDependencies to React >=19.0.0
  - Refactored type definitions for React 19 compatibility
  - Updated ref handling to work with React 19's stricter element types
  - Removed HTMLElement from generic types (React 19 uses more specific element types)
  - Updated style types to support React 19's new CSS properties

  **Breaking Changes:**

  - Minimum React version: 19.0.0 (previously >=16.8.0)
  - Type definitions updated for React 19's stricter typing

  **Migration Guide:**

  - If you're using React 18 or earlier, stay on v1.x
  - For React 19 projects, upgrade to v2.x
  - No code changes required for most use cases
  - TypeScript users may need to update type annotations if using custom element types

  **Other Changes:**

  - 25 essential motion hooks for React applications
  - Full TypeScript support with comprehensive type definitions
  - Zero external dependencies, lightweight and performant
  - SSR ready for Next.js and other frameworks
  - Extensive test coverage (74%+ functions)
  - Intuitive API design for easy integration
  - Covers fade, slide, scale, scroll, and interaction animations
