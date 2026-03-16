# @hua-labs/utils

## 1.1.4

### Patch Changes

- Package consolidation for public release.
  - **ui**: className → dot prop migration (MIGRATION NOTE: components no longer accept className), dashboard decomposition into semantic subpaths, OKLCH color palette, SDUI registry expansion
  - **motion-core**: absorb 18 hooks from hua-pro (auto-play, orchestration, interaction, specialized)
  - **hua**: remove pro re-exports, update umbrella exports for motion-core absorption
  - **i18n**: I18nPlatformAdapter, legal document migration, dependency updates
  - **utils/hooks/state**: dependency updates
  - **security**: remove private flag, public release preparation
  - **eslint-plugin-i18n**: public release with documented API

## 1.1.3

### Patch Changes

- Maintenance: fix sanitize double-escape issue, framework rename cleanup, internal dependency updates

## 1.1.2

### Patch Changes

- docs: update package READMEs and clean internal references

## 1.1.1

### Patch Changes

- Complete test coverage across all 16 packages (3,255 tests). Regenerate README.md and ai.yaml documentation for all packages. Fix docs-engine vitest compatibility.

## 1.1.0

### Initial Release

- Initial release
