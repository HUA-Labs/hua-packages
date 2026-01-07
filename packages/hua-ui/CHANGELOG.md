# @hua-labs/ui

## 1.1.0-alpha.5

### Patch Changes

- eb4e132: docs(ui): update icon system documentation (Untitled → Iconsax)

  - Replace all mentions of 'Untitled' with 'Iconsax' in icon documentation
  - Update README_ICONS.md and ICON_SYSTEM.md
  - Addresses copyright concerns with Untitled Icons

## 1.1.0-alpha.4

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
  - @hua-labs/motion-core@2.1.0-alpha.3

## 1.1.0-alpha.3

### Patch Changes

- f7d08f1: chore: align external dependency versions across all packages

  - Introduce syncpack for automated dependency version management
  - Align @types/node to ^25.0.3 across all packages
  - Align TypeScript to ^5.9.3 across all packages
  - Align React ecosystem packages to consistent versions
  - Add dependency management scripts: deps:check, deps:fix, deps:format

  This ensures consistent behavior across the monorepo and prevents version conflicts.

- Updated dependencies [f7d08f1]
  - @hua-labs/motion-core@2.1.0-alpha.2

## 1.1.0-alpha.2

### Patch Changes

- a1aa8e9: fix: Fix package.json exports to use dist instead of src

  Fixed exports configuration in @hua-labs/state and @hua-labs/ui:

  - Changed all import/require paths from src/_.ts to dist/_.js
  - Fixed module field to point to dist/_.js instead of dist/_.mjs
  - This resolves "Module not found" and "Missing module type" errors in Next.js projects

  Affected packages:

  - @hua-labs/state: Fixed main entry and integrations/i18n exports
  - @hua-labs/ui: Fixed main entry and all subpath exports (advanced, form, navigation, feedback, components)

## 1.1.0-alpha.1

### Minor Changes

- Public alpha release with complete documentation

  - Complete README standardization across all packages
  - Comprehensive DETAILED_GUIDE documentation for each package
  - Optimized npm keywords for better discoverability
  - Professional documentation tone and structure
  - All packages updated to alpha.0.2

### Patch Changes

- Updated dependencies
  - @hua-labs/motion-core@2.1.0-alpha.1

## 0.1.0-alpha.0.1

### Minor Changes

- 31920d5: Major update to UI package with advanced features and improved build

  - Updated build system to use tsup for optimal bundling
  - Added advanced UI components including Dashboard and Motion modules
  - Improved component architecture and exports
  - Enhanced TypeScript support with better type definitions
  - Added comprehensive component library (50+ components)

### Patch Changes

- Updated dependencies [31920d5]
  - @hua-labs/motion-core@2.0.1
