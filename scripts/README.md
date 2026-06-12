# Scripts

This repository is the public package workspace for HUA Labs packages. Keep
scripts here limited to commands that work in this repository without private
monorepo state.

## Documentation

| Script                        | Command                       | Purpose                                                                           |
| ----------------------------- | ----------------------------- | --------------------------------------------------------------------------------- |
| `generate-docs.ts`            | `pnpm generate:docs`          | Generate package `README.md` files and `ai-docs/*.ai.yaml` files from `doc.yaml`. |
| `generate-docs.ts --validate` | `pnpm generate:docs:validate` | Check generated package docs for drift.                                           |

## Package Checks

| Command           | Purpose                                |
| ----------------- | -------------------------------------- |
| `pnpm build`      | Build packages through Turbo.          |
| `pnpm type-check` | Run package type checks through Turbo. |
| `pnpm lint`       | Run package lint tasks through Turbo.  |
| `pnpm test`       | Run package tests through Turbo.       |

## Release Helpers

| Script                       | Purpose                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `check-pack-artifacts.js`    | Inspect packed `.tgz` artifacts for missing type entries, `workspace:*` specs, and unintended source/test payload. |
| `check-publish-allowlist.js` | Fail when a public workspace package is not listed in `config/publish-allowlist.json`.                             |
| `prepare-publish.js`         | Convert local `workspace:*` dependencies to publishable package versions before manual package inspection.         |
| `restore-workspace.js`       | Restore `workspace:*` dependencies after manual publish preparation.                                               |

## Manual Analysis

| Script                | Purpose                          |
| --------------------- | -------------------------------- |
| `analyze-export.js`   | Inspect package export surfaces. |
| `dot-audit.ts`        | Run dot package audits.          |
| `generate-palette.ts` | Generate palette data.           |

Do not document private monorepo-only scripts here unless the files are present
and the command works from this public repository.
