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
| `safe-release.mjs preflight` | Classify plan state while admitting only bounded same-version eligible drift for an empty snapshot.               |
| `safe-release.mjs refresh`   | Rebind a verified empty snapshot to reviewed current manifests without creating release authority.                |
| `safe-release.mjs version`   | Validate a nonempty Changesets selection, version it, and write the durable exact release plan.                   |
| `safe-release.mjs check`     | Revalidate policy, plan digest, and every current manifest without executing registry or credential commands.     |
| `safe-release.mjs pack`      | Build, pack, inspect, and hash every exact planned package into one external immutable artifact bundle.           |
| `safe-release.mjs claim`     | Commit and push one exact planned-to-publishing transition bound to the verified artifact-manifest SHA.           |
| `safe-release.mjs publish`   | Reverify and publish only the claimed immutable tarballs with package lifecycle scripts disabled.                 |
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
planned-plan check. A planned plan remains manifest-exact in `check` and cannot
publish directly.

The ordinary main-push path is intentionally token-free while it creates or
updates a version PR. Its dedicated preflight classifies exact `empty`,
`planned`, and `publishing` states before refresh. Only an exact empty plan may
admit same-version manifest-byte drift, and only for policy-eligible packages;
policy, roster, identity, version, plan digest, and canonical-byte authority
remain exact. The following credential-free refresh binds those reviewed
manifest bytes before Changesets status/version executes. A merged version PR
is already `planned`, so preflight remains manifest-exact, skips refresh and
the Changesets action, and proceeds to exact plan validation.
Its explicit `check --format=github --allow-empty` lane classifies an exact
empty plan only as `publish=false`; ordinary `check`, `version`, and `publish`
reject empty release authority.

The prepare job has neither npm credentials nor OIDC `id-token` authority. For
an exact planned set it builds every selected package, including an unscoped
package such as `create-hua` when explicitly selected, packs each package into
a caller-owned external directory, and runs `check-pack-artifacts.js` against
the complete exact tarball set. A bounded canonical manifest binds every
tarball filename, byte count, SHA-256, package name and version to the planned
plan digest, exact source head, `main`, and GitHub run ID. Package-check failure,
missing or extra artifacts, tarball substitution, or manifest drift prevents
both claim and publish. The uploaded artifact is evidence only until the claim
is durably pushed.

After that credential-free artifact check and upload, the prepare job commits
and pushes a single plan-only `planned` to `publishing` claim that additionally
binds the exact artifact-manifest SHA-256. Local and remote heads must match
before the commit, must still match before push, and the normal
non-fast-forward push remains the final race gate. Any claim failure happens
before an OIDC-capable job, npm credentials, or publish.
Any later workflow run that starts from the claim commit sees `publishing`,
skips refresh, versioning, claim, credentials, and publish, and performs no
second release attempt. GitHub-token pushes are not relied on to recursively
start another workflow.

A separate publish job is the only job with `id-token: write`; it cannot start
until the prepare job reports the exact pushed claim head. It checks out that
head, requires both local `HEAD` and remote `main` to remain that exact claim,
downloads the run-scoped bundle, and revalidates the plan, claim, canonical
manifest, complete directory population, tarball bytes, hashes, and internal
package name/version before any npm command. It publishes the exact
tarball paths with `npm publish --ignore-scripts`, never mutable package
directories, so package lifecycle hooks cannot rerun after credential
exposure. The npm token is present only on that publish step. Its temporary
`RUNNER_TEMP` npmrc is removed before the step completes; neither the sanitized
result upload nor the later closure job receives the npm token.

Empty, stale, held, never-publish,
pending, private, wrong-authority, unknown, missing, extra, or tampered sets
stop before any publish or provenance command. Provenance is execution evidence
for the exact published output; historical attestations never select a release.
After exact publish, only `check-npm-provenance --published <file> --close-plan`
may produce the next empty snapshot, and only after every exact published
`package@version` has passed the current provenance check. There is no separate
close CLI or package script. A failed or partial publication or provenance
check retains the planned file and must be resolved by the operator, never
auto-refreshed. The same provenance command runs in a separate no-OIDC,
no-npm-credential closure job, then commits and pushes only the canonical empty
plan. It requires the exact claim head to remain both local and remote
authority before commit and push. A head drift or non-fast-forward failure
leaves remote main in `publishing`, so later workflow runs use zero npm
credentials and cannot publish the same plan again. Operator reconciliation is
required before another release. A successful closure commit restores the
next Changesets cycle; the next externally triggered run starts from exact
`empty` authority and uses publish/token zero. No recursive workflow trigger is
claimed.

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
bypass. The policy now binds only public authority kind
`platform-release-registry` and exact opaque commit, tree, registry blob, and
registry SHA facts; the exposure checker was not weakened or excepted.

The first lifecycle RED left a successful published plan permanently planned,
and an intermediate correction exposed a separately callable close command.
The final boundary makes close an internal consequence of the exact provenance
check, preserves the planned bytes on every publication/provenance failure,
claims the planned merge before credentials, and durably pushes the resulting
empty plan. A distinct workflow-order RED proved that unconditional refresh
blocked every planned merge and that runner-local closure left main permanently
planned. The final Git fixtures lock claim/closure head equality,
non-fast-forward failure, plan-only commits, publishing-run suppression, and
the next empty cycle. This exact-12 implementation has no devlog path; this
durable contract plus the frozen-tuple report records the RED/GREEN provenance
without adding a thirteenth path.

The credential/artifact RED then proved two further execution gaps: job-level
OIDC authority existed during checkout/build/versioning, and directory publish
could rerun package lifecycle code after npm credentials while bypassing the
existing pack checker. On the exact checkpoint, a locally built current UI
tarball was rejected by that checker for the three missing type references
`dist/landing.d.ts`, `dist/native.d.ts`, and `dist/sdui.d.ts`; this is a truthful
pre-publication blocker, not a reason to weaken the checker. The final boundary
splits prepare, publish, and closure permissions; binds checked artifact bytes
into the durable claim; and publishes only reverified tarballs with lifecycle
scripts disabled. No npm query, publish, token use, OIDC request, or workflow
dispatch was executed while implementing or testing this contract.

## Manual Analysis

| Script                | Purpose                          |
| --------------------- | -------------------------------- |
| `analyze-export.js`   | Inspect package export surfaces. |
| `dot-audit.ts`        | Run dot package audits.          |
| `generate-palette.ts` | Generate palette data.           |

Do not document private monorepo-only scripts here unless the files are present
and the command works from this public repository.
