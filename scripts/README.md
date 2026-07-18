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
| `safe-release.mjs refresh`   | Rebind a verified empty snapshot to reviewed current manifests without creating release authority.                |
| `safe-release.mjs version`   | Validate a nonempty Changesets selection, version it, and write the durable exact release plan.                   |
| `safe-release.mjs check`     | Revalidate policy, plan digest, and every current manifest without executing registry or credential commands.     |
| `safe-release.mjs publish`   | Publish only the nonempty exact validated plan through fixed `pnpm publish` argv and package directories.         |
| `check-npm-provenance.mjs`   | Check provenance for the exact published set and optionally close that exact plan only after every check passes.  |
| `prepare-publish.js`         | Convert local `workspace:` dependencies to publishable package versions before manual package inspection.         |
| `restore-workspace.js`       | Restore `workspace:` dependencies after manual publish preparation.                                               |

## Safe release boundary

`config/publish-allowlist.json` is a checked projection of the exact HUA
platform release-intent authority. It records policy, not npm visibility.
`config/release-plan.json` is the generated durable selection authority. The
version command captures Changeset IDs and bytes before Changesets deletes the
source files, rejects implicit dependent releases, runs the version command,
then binds the complete post-version workspace manifest set.

An empty plan is deliberately not release authority. `refresh` first verifies
the old empty plan's policy tuple, schema, roster, and digest, then captures the
current reviewed manifest bytes only when changed manifests remain at the same
version and belong to policy-eligible packages. It never refreshes blocked
held, never-publish, pending, private, or no-publish authority, never overwrites
a planned set, and cannot add or select a package. This lets a later reviewed
source/manifest sync plus a new Changeset enter `version` without weakening the
planned-plan check. A planned plan remains manifest-exact in `check`, `publish`,
and provenance.

The ordinary main-push path is intentionally token-free while it creates or
updates a version PR. Its explicit `check --format=github --allow-empty` lane
may classify an exact empty plan only as `publish=false`; ordinary `check`,
`version`, and `publish` reject empty release authority. A later main push may
expose npm credentials only after the checked plan is nonempty and exact.
Empty, stale, held, never-publish,
pending, private, wrong-authority, unknown, missing, extra, or tampered sets
stop before any publish or provenance command. Provenance is execution evidence
for the exact published output; historical attestations never select a release.
After exact publish, only `check-npm-provenance --published <file> --close-plan`
may produce the next empty snapshot, and only after every exact published
`package@version` has passed the current provenance check. There is no separate
close CLI or package script. A failed or partial publication or provenance
check retains the planned file and must be resolved by the operator, never
auto-refreshed. The workflow-local empty snapshot is not durable repository
authority: a separate credential-free reviewed source change must commit that
exact plan delta before the next source or version cycle can proceed.

The current committed plan is empty. Choosing a version, selecting UI alone or
an explicit cohort, approving npm publication, and choosing token versus OIDC
remain operator release decisions. Dot and Motion are not inferred from UI
dependencies: Dot is blocked by its current `no-publish` mode, and Motion is
eligible only when an explicit reviewed Changeset selects it.

After a successful version run, review the version diff, packed artifacts,
policy SHA, plan digest, exact `fromVersion`/`toVersion` set, and the complete
manifest snapshot before merging the version PR. After publication and exact
provenance, review and persist the provenance-owned empty-plan delta before the next source or
version cycle. There is no true npm rollback; post-publication recovery requires
deprecation and a separately authorized corrective version.

### Pre-freeze boundary corrections

The first public-exposure RED stored a private repository identity as three
separately reconstructable fields. The public checker correctly rejected that
bypass. The policy now binds only a public `authorityKind` and exact opaque
commit, tree, registry blob, and registry SHA facts; the exposure checker was
not weakened or excepted.

The first lifecycle RED left a successful published plan permanently planned,
and an intermediate correction exposed a separately callable close command.
The final boundary makes close an internal consequence of the exact provenance
check, preserves the planned bytes on every publication/provenance failure,
and requires the resulting empty plan to land as a reviewed credential-free
source change before the next release cycle. This exact-12 implementation has
no devlog path; this durable contract plus the frozen-tuple report records the
RED/GREEN provenance without adding a thirteenth path.

## Manual Analysis

| Script                | Purpose                          |
| --------------------- | -------------------------------- |
| `analyze-export.js`   | Inspect package export surfaces. |
| `dot-audit.ts`        | Run dot package audits.          |
| `generate-palette.ts` | Generate palette data.           |

Do not document private monorepo-only scripts here unless the files are present
and the command works from this public repository.
