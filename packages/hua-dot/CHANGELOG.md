# @hua-labs/dot

## 0.2.2

### Patch Changes

- Restore npm provenance enforcement for dot-family releases and keep the public dot README concise.

## 0.2.1

### Patch Changes

- Align public documentation claims with current dot resolver and AX catalog evidence.

## 0.2.0

### Minor Changes

- Dot style engine improvements: semantic tokens (info/success/warning), space-y auto-flex, native codegen (Swift & Compose), test stability fixes.

## 0.1.1

### Patch Changes

- Package consolidation for public release.
  - **ui**: className → dot migration, dashboard decomposition into semantic subpaths, OKLCH color palette, SDUI registry expansion
  - **motion-core**: absorb 18 hooks from hua-pro (auto-play, orchestration, interaction, specialized)
  - **hua**: remove pro re-exports, update umbrella exports for motion-core absorption
  - **i18n**: I18nPlatformAdapter, legal document migration, dependency updates
  - **utils/hooks/state**: dependency updates
  - **security**: remove private flag, public release preparation
  - **eslint-plugin-i18n**: public release with documented API
  - **dot ecosystem**: first public npm publish (dot, dot-aot, dot-lsp, dot-mcp)
