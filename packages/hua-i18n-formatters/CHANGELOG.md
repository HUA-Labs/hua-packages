# @hua-labs/i18n-formatters

## 2.2.0

### Minor Changes

- Package consolidation for public release.
  - **ui**: className → dot prop migration (MIGRATION NOTE: components no longer accept className), dashboard decomposition into semantic subpaths, OKLCH color palette, SDUI registry expansion
  - **motion-core**: absorb 18 hooks from hua-pro (auto-play, orchestration, interaction, specialized)
  - **hua**: remove pro re-exports, update umbrella exports for motion-core absorption
  - **i18n**: I18nPlatformAdapter, legal document migration, dependency updates
  - **utils/hooks/state**: dependency updates
  - **security**: remove private flag, public release preparation
  - **eslint-plugin-i18n**: public release with documented API

### Patch Changes

- Updated dependencies
  - @hua-labs/i18n-core@2.2.0

## 2.1.0

### Patch Changes

- Updated dependencies
  - @hua-labs/i18n-core@2.1.0

## 2.0.5

### Patch Changes

- docs: update package READMEs and clean internal references
- Updated dependencies
  - @hua-labs/i18n-core@2.0.5

## 2.0.2

### Patch Changes

- Complete test coverage across all 16 packages (3,255 tests). Regenerate README.md and ai.yaml documentation for all packages. Fix docs-engine vitest compatibility.
- Updated dependencies
  - @hua-labs/i18n-core@2.0.2

## 1.1.0

### Initial Release

- Initial release
