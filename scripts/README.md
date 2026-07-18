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

| Script                       | Purpose                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `check-pack-artifacts.js`    | Inspect packed `.tgz` artifacts for missing type entries, `workspace:` specs, and unintended source/test payload. |
| `check-publish-allowlist.js` | Validate the versioned platform-policy projection against every workspace manifest.                               |
| `safe-release.mjs version`   | Validate a nonempty Changesets selection, version it, and write the durable exact release plan.                   |
| `safe-release.mjs check`     | Revalidate policy, plan digest, and every current manifest without executing registry or credential commands.     |
| `safe-release.mjs publish`   | Publish only the nonempty exact validated plan through fixed `pnpm publish` argv and package directories.         |
| `check-npm-provenance.mjs`   | Check provenance only for the exact published `package@version` output matching the durable plan.                 |
| `prepare-publish.js`         | Convert local `workspace:` dependencies to publishable package versions before manual package inspection.         |
| `restore-workspace.js`       | Restore `workspace:` dependencies after manual publish preparation.                                               |

## Safe release boundary

`config/publish-allowlist.json` is a checked projection of the exact HUA
platform release-intent authority. It records policy, not npm visibility.
`config/release-plan.json` is the generated durable selection authority. The
version command captures Changeset IDs and bytes before Changesets deletes the
source files, rejects implicit dependent releases, runs the version command,
then binds the complete post-version workspace manifest set.

The ordinary main-push path is intentionally token-free while it creates or
updates a version PR. Its explicit `check --format=github --allow-empty` lane
may classify an exact empty plan only as `publish=false`; ordinary `check`,
`version`, and `publish` reject empty release authority. A later main push may
expose npm credentials only after the checked plan is nonempty and exact.
Empty, stale, held, never-publish,
pending, private, wrong-authority, unknown, missing, extra, or tampered sets
stop before any publish or provenance command. Provenance is execution evidence
for the exact published output; historical attestations never select a release.

The current committed plan is empty. Choosing a version, selecting UI alone or
an explicit cohort, approving npm publication, and choosing token versus OIDC
remain operator release decisions. Dot and Motion are not inferred from UI
dependencies: Dot is blocked by its current `no-publish` mode, and Motion is
eligible only when an explicit reviewed Changeset selects it.

After a successful version run, review the version diff, packed artifacts,
policy SHA, plan digest, exact `fromVersion`/`toVersion` set, and the complete
manifest snapshot before merging the version PR. There is no true npm rollback;
post-publication recovery requires deprecation and a separately authorized
corrective version.

## Manual Analysis

| Script                | Purpose                          |
| --------------------- | -------------------------------- |
| `analyze-export.js`   | Inspect package export surfaces. |
| `dot-audit.ts`        | Run dot package audits.          |
| `generate-palette.ts` | Generate palette data.           |

Do not document private monorepo-only scripts here unless the files are present
and the command works from this public repository.
