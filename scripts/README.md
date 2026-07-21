# Scripts

This repository is the public package workspace for HUA Labs packages. Keep
scripts here limited to commands that work in this repository without private
monorepo state.

## Documentation

| Script                        | Command                       | Purpose                                                                                                                                              |
| ----------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generate-docs.ts`            | `pnpm generate:docs`          | Generate package `README.md` files and `ai-docs/*.ai.yaml` files from `doc.yaml`; UI output is filtered through its non-shipped public-core profile. |
| `generate-docs.ts --validate` | `pnpm generate:docs:validate` | Check generated package docs and profile-derived UI output for drift.                                                                                |

## Package Checks

| Command           | Purpose                                |
| ----------------- | -------------------------------------- |
| `pnpm build`      | Build packages through Turbo.          |
| `pnpm type-check` | Run package type checks through Turbo. |
| `pnpm lint`       | Run package lint tasks through Turbo.  |
| `pnpm test`       | Run package tests through Turbo.       |

## Release Helpers

| Script                          | Purpose                                                                                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `check-ui-source-authority.mjs` | Validate the opaque platform/public HUA UI path map and fail closed on unmapped or disposition-breaking source drift.                                    |
| `check-pack-artifacts.js`       | Inspect packed `.tgz` artifacts for missing type/runtime entries, `workspace:` specs, unintended source/test payload, and exact package authority gates. |
| `check-publish-allowlist.js`    | Validate the versioned platform-policy projection against every workspace manifest.                                                                      |
| `safe-release.mjs preflight`    | Classify plan state while admitting only bounded same-version reviewed-public drift for an empty snapshot.                                               |
| `safe-release.mjs authority`    | Fail closed unless current GitHub policy and any claim/closure transition match the reviewed-boundary contract.                                          |
| `safe-release.mjs refresh`      | Rebind a verified empty snapshot to reviewed current manifests without creating release authority.                                                       |
| `safe-release.mjs version`      | Validate a nonempty Changesets selection, version it, and write the durable exact release plan.                                                          |
| `safe-release.mjs check`        | Revalidate policy, plan digest, and every current manifest without executing registry or credential commands.                                            |
| `safe-release.mjs pack`         | Build the deterministic workspace-prerequisite closure, then pack, inspect, and hash only the exact planned packages.                                    |
| `safe-release.mjs claim`        | Commit one exact artifact-bound planned-to-publishing transition on a reviewed PR branch without moving main.                                            |
| `safe-release.mjs publish`      | Reverify, resume, publish, and install-check claimed tarballs in dependency-first order.                                                                 |
| `check-npm-provenance.mjs`      | Check exact provenance and prepare a reviewed empty-plan PR branch only after every check passes.                                                        |
| `prepare-publish.js`            | Convert local `workspace:` dependencies to publishable package versions before manual package inspection.                                                |
| `restore-workspace.js`          | Restore `workspace:` dependencies after manual publish preparation.                                                                                      |

## Safe release boundary

`config/ui-source-authority.json` is the deterministic path-level boundary for
the reviewed HUA UI source synchronization train. It stores no repository slug,
host path, owner identity, credential, or release selection. Instead it binds
opaque source and public-base commits/trees plus every currently different UI
source path, its exact byte hashes, and one disposition:
`platform-exact`, `public-preserved`, `derived-reviewed`, or `deferred`.
Canonical ordering, exact keys, duplicate/unknown paths, map digests, current
worktree bytes, and public-base Git objects fail closed. The checker uses a
fixed Git executable with a minimal process environment, requires the complete
tracked UI source manifest to match HEAD and an ordinary stage-zero index, and
hashes every tracked raw worktree file rather than trusting index stat hints.
Authority-tree presence, bounded blob size, bounded content read, and absence
are distinct outcomes; a failed or oversized blob read cannot become nullable
absence. A reviewer with the exact source repository may additionally pass
`--source-repo <path>` to verify the source commit/tree/blobs and prove the
150-row difference set is complete.
M810 admits exactly 14 `platform-exact` core-interoperability paths from
platform commit `f9ceddaa02c4b544b108d5ab68766a965e36b58d`: `Slot`,
`web-classname`, `Box`, `Text`, `Pressable`, `Button`, and `Action`, paired with
their focused tests. M814 admits 10 more byte-exact interaction and accessibility
paths from that same authority: `BottomSheet`, `Drawer`, `Textarea`, `Toast`, and
`Tooltip`, paired with their focused tests. The test locks all 24 admitted paths
and independently rejects a self-consistent reclassification in the remaining
126-row authority set. M828 advances the source authority to platform commit
`4a710400e2920073c29cb942e148f65bf3c44c6e` and admits 10 more byte-exact DOM
class-name paths: `FormControl`, `Link`, `LoadingSpinner`, `PageTransition`, and
`Section`, paired with their focused tests. The map now contains 34
`platform-exact`, 62 `deferred`, and 54 `public-preserved` rows. The test locks
the M828 10-row projection separately from the complete 34-path admitted roster
and independently rejects a self-consistent reclassification in the remaining
116-row authority set. Every other mapped source path keeps its prior
fail-closed disposition. M835 advances the source authority to landed M838
platform commit `72d311fa84c596397f338cd06b9bfc541448af61` and admits 17
byte-exact icon/core rows: `ActionToolbar`, `Bookmark`, `Card`, `Divider`,
`Icon`, `ScrollProgress`, the icon alias/catalog/name/provider/lookup/normalizer
graph, and the Bookmark, Icon, alias, provider, and normalizer evidence tests.
The vendor-catalog test remains deferred with the Lucide route while the
platform-exact catalog production byte is retained. All 12 production rows remain reachable
from the retained root or advanced entries in the non-shipped M834 public-core
profile. The map now contains 51 `platform-exact`, 51 `deferred`, and 48
`public-preserved` rows. The focused test locks the exact 17-row projection,
the complete 51-path admitted roster, and the remaining 133-row digest; a
self-consistent reclassification outside M835 still fails closed. These
projections do not copy package, export, dependency, version, Changeset, lock,
workflow, or generated-document authority.
M840 advances the source authority to platform commit
`6be90ccac2f83f8c0fb7befb7310bbcbc590cce6` and admits the byte-exact Kanban
board, card, family README, and 40-case transaction/interaction evidence test.
The platform-exact installed-boundary test separately proves the retained
`./interactive/kanban` package route with and without the optional React DOM
peer; it is public release evidence and is not a UI source-map row. The map now
contains 55 `platform-exact`, 47 `deferred`, and 48 `public-preserved` rows.
The focused authority test retains the M835 icon/core lock, locks the exact
four-row M840 projection and complete 55-path admitted roster, and independently
rejects a self-consistent reclassification in the remaining 146-row authority
set. M840 does not change the generic checker, public package profile,
manifest/export/dependency/version, lock, workflow, Changeset, release plan, or
generated-document authority.
The pack-artifact checker always runs the current public-side gate first, so a
source sync cannot reach immutable tarball evidence with an unreviewed byte or
an unupdated disposition. This authority map is verification evidence only: it
does not select a version, Changeset, npm package, credential, or publication.

`packages/hua-ui/public-core-profile.json` is the non-shipped compiler/source
authority for the public UI core candidate. It partitions all 37 platform
package entries into exactly 27 retained and 10 deferred entries (30 JavaScript
and 7 assets), requires `releaseSelection: null`, and binds the installed Node
floor to `>=20.16.0`. The documentation writer requires this profile for UI,
derives the README and AI retained/deferred rosters from it, and removes API
notes whose import route is deferred. The generated output describes only
source readiness; it cannot establish final tarball, DTS, installed-consumer,
version, release-plan, npm, publication, or deployment authority.

For an `@hua-labs/ui` tarball, `check-pack-artifacts.js` composes the existing
Dot, AOT, LSP, MCP, and UI source gates, then revalidates the packed manifest
against the workspace/profile contract. Every retained runtime, CSS, and DTS
target must exist; every deferred target, the profile itself, tests, and other
unreviewed payload must be absent; and the shipped detailed guide must be
present. The checker validates evidence only and never creates release
selection or publication authority.

`config/publish-allowlist.json` is a checked projection of the exact HUA
platform release-intent authority. It records policy, not npm visibility.
`config/release-plan.json` is the generated durable selection authority. The
version command captures Changeset IDs and bytes before Changesets deletes the
source files, rejects implicit dependent releases, and requires an exact
bidirectional relation between every normalized Changeset selection and every
release row. Each selected package must have one release row containing the
exact selecting Changeset IDs, the release type must equal the strongest
selected `patch`/`minor`/`major` type, and a neutral row cannot consume a
selection. After the version command returns, the guard re-reads the exact
`.changeset/*.md` source set and requires it to be empty before it can bind the
complete post-version workspace manifest set or write planned authority. The
pre-version source-set equality means this proves both that every admitted
source was consumed and that no unexpected source remains.

An empty plan is deliberately not release authority. `refresh` first verifies
the old empty plan's policy tuple, schema, roster, and digest, then captures the
current reviewed manifest bytes only when changed manifests remain at the same
version and belong to policy-eligible packages. Eligibility accepts the exact
public authority tuple `active-public / hua-packages / npm-public` with either
`public-npm` or `no-publish` mode. The latter is an alternate-authority case:
Dot and Dot AOT remain non-publishable from the platform repository while their
reviewed public projections may be selected only here. Refresh still rejects
held, never-publish, pending, private, wrong-authority, and wrong-channel drift,
never overwrites a planned set, and cannot add or select a package. This lets a
later reviewed source/manifest sync plus a new Changeset enter `version`
without weakening the planned-plan check. A planned plan remains manifest-exact
in `check` and cannot publish directly.

Workspace manifest `private` authority is accepted only when the field is
absent or Boolean. Absent and explicit `false` are public manifest truth;
strings, numbers, null, arrays, objects, and other malformed present values fail
before normalization, preflight, or refresh.

The ordinary empty-plan main-push path does not require the external policy
credential while it creates or updates a version PR. Its dedicated preflight
classifies exact `empty`, `planned`, and `publishing` states and detects an
exact publishing-to-empty closure transition before refresh. Only an ordinary
exact empty plan may admit same-version manifest-byte drift, and only for
policy-eligible packages; policy, roster, identity, version, plan digest, and
canonical-byte authority remain exact. The following credential-free refresh
binds those reviewed manifest bytes before Changesets status/version executes
without changing release eligibility.
A merged version PR is already `planned`, and a reviewed closure merge is an
external-policy-bearing transition, so both require the policy gate before any
artifact, claim, OIDC, publish, or closure admission. A planned plan remains
manifest-exact, skips refresh and the Changesets action, and proceeds to exact
plan validation only after that gate.
Its explicit `check --format=github --allow-empty` lane classifies an exact
empty plan only as `publish=false`; ordinary `check`, `version`, and `publish`
reject empty release authority.

The prepare job has neither npm credentials nor OIDC `id-token` authority.
Release-bearing states use only the separately provisioned
`HUA_GITHUB_POLICY_TOKEN` for bounded reads of the exact public repository's
classic `main` branch protection, effective branch rules, repository/parent
ruleset summaries, the Actions review setting, and, when applicable, the one
merged claim or closure PR. This v1 positive path requires Administration(read)
plus the additional read permissions needed for PR association, review, head,
and tree facts. Both effective branch rules and repository/parent ruleset
summaries must be exactly empty; any ruleset presence is unsupported and fails
closed. This avoids granting Administration(write) merely to observe the
intentionally omitted ruleset `bypass_actors` field. Supporting rulesets later
requires a separate reviewed authorization lane. The ordinary workflow
`GITHUB_TOKEN` is never accepted as this policy credential. The source invokes
fixed `/usr/bin/gh`, bounds every JSON response, reports a missing dedicated
credential as exact `policy-credential-unavailable`, collapses unauthorized,
malformed, partial, or inconsistent API authority to exact
`external-policy-blocked`, and rechecks remote `main` before and after the read.
The protected branch requires the exact six GitHub Actions contexts
`type-check`, `lint`, `test`, `doc-validation`, `publish-allowlist`, and
`public-exposure` in strict mode, bound to the GitHub Actions App. Ordinary
source PRs do not require a second operator-owned GitHub identity or resolution
of advisory bot threads: canonical cross-agent CLEAN is the ordinary
source-review authority. Classic approval counting must remain absent and
conversation-resolution enforcement disabled. Claim and closure transitions
still require their own exact human approval described below. An unexpected,
partial, duplicate, differently sourced, or extra required check, API error, or
otherwise incomplete response fails closed. For an exact
planned set it resolves each selected package's `workspace:` dependencies and
optional dependencies, builds that complete dependency-first closure once,
then packs only the selected release rows. An eligible but unselected package
may be built as a prerequisite without becoming selected, packed, or
publishable. An unscoped package such as `create-hua` is built and packed only
when explicitly selected. Pack runs with package lifecycle scripts disabled;
before starting each pack child it removes every inherited case variant of the
npm-compatible and pnpm-native ignore-scripts environment keys, then sets one
canonical true value for each. Supported pnpm generations therefore retain
their intentional workspace-manifest normalization without an ambient
lowercase, uppercase, or mixed-case false value re-enabling prepack, prepare,
or postpack hooks. After the complete build closure, the guard re-reads
the canonical policy, release plan, and every workspace manifest and requires
the exact planned bytes and manifest hashes captured before any build. It
repeats that check after each pack and after the artifact checker, so a build or
pack command cannot change planned package metadata or release authority
before artifact admission. The guard writes every tarball into a caller-owned
external directory and runs `check-pack-artifacts.js` against the complete
exact selected tarball set. A bounded canonical manifest binds every
tarball filename, byte count, SHA-256, package name and version to the planned
plan digest, exact source head, `main`, and GitHub run ID. Package-check failure,
missing or extra artifacts, tarball substitution, or manifest drift prevents
both claim and publish. The uploaded artifact is evidence only until the claim
is durably pushed.

After that release-credential-free artifact check and upload, the prepare job commits
a single plan-only `planned` to `publishing` claim that additionally binds the
exact artifact-manifest SHA-256. It pushes only a unique transition branch,
requires remote `main` to remain exact before and after that push, and opens a
reviewed claim PR. It never pushes protected `main` directly. The claim PR must
be squash-merged so the resulting main commit has the planned source head as
its single parent and changes only `config/release-plan.json`. Before the
OIDC-capable job can be admitted, the authority gate additionally requires one
unique merged PR association, exact `main` base/source, exact deterministic
`release/claim-<source>` branch, exact PR-head tree and current merge commit,
and a latest exact-head approval from a human GitHub user distinct from the PR
author. The transition PR author may be the exact `github-actions[bot]` actor,
but bot reviewers and user/bot type mismatches fail closed.
Zero, self-only, stale, wrong-head, wrong-branch, duplicate, or head-drifting
associations fail closed. Any claim or PR failure happens before an
OIDC-capable job, npm credentials, or publish.

A separate publish job is the only job with `id-token: write`. It runs only for
the reviewed claim merge, never on the planned run that created the PR. A
reviewed workflow retry is allowed because publication is reconciled against
immutable registry evidence rather than assumed to be a fresh first attempt.
The publishing run reads the original artifact run ID and source head from the
durable claim and downloads the content-addressed cross-run bundle named from
the exact claimed artifact-manifest SHA-256. Repacking the same bytes may
replace only that same content identity; different bytes produce a different
artifact name and cannot overwrite the claimed bundle. The sanitized published
set uses a run-attempt-specific artifact name exported by the publish job and
consumed through the exact `needs.publish` output. A full rerun therefore writes
a fresh handoff, while a failed-job rerun keeps the successful publish attempt's
exact output instead of colliding with upload-artifact v4's immutable namespace.
Before that
OIDC-capable job is admitted, the no-OIDC prepare check requires local `HEAD`
and remote `main` to match and requires a single-parent plan-only claim
transition. The publish job repeats those checks and revalidates the plan,
claim, canonical manifest, complete directory population, tarball bytes,
hashes, and internal package name/version before any npm command. It computes
the tarball's SHA-512 SRI from those re-read bytes and publishes exact tarball
paths with `npm publish --ignore-scripts`, never mutable package directories,
so package lifecycle hooks cannot rerun after credential exposure. The npm
token is present only on that publish step. Its temporary `RUNNER_TEMP` npmrc
is removed before the step completes; neither the sanitized result upload nor
the later closure job receives the npm token.

Selected packages are processed in deterministic dependency-topological order.
Before each package, the guard observes the exact npm name/version, integrity,
and SLSA provenance predicate. Exact E404 absence permits publish; an existing
artifact with byte-identical SHA-512 integrity and SLSA v1 provenance is a
verified resume and skips the immutable publish call; any differing immutable
artifact is a conflict. Timeout, malformed, incomplete, or not-yet-consistent
responses are retried within the bounded observation window and then fail
closed. A newly published artifact must reach the same exact registry and
provenance state before progress continues.

After registry verification, a fresh caller-owned temporary npm consumer
installs the exact package version with lifecycle scripts disabled. Before npm
is reached, the guard also requires each packed workspace dependency to be
declared exactly once at its exact planned or current version; mutable tags and
ranges such as `latest` or `^1.2.3` fail closed. The consumer then checks the
installed package identity and uses `npm ls` to require every workspace
dependency at that exact version. The temporary consumer is
removed on success or failure, and no dependent package is attempted until
that install boundary passes. This permits safe reviewed resume after a
partial run while preventing a dependency from publishing before the registry
can actually install its prerequisite.

Empty, stale, held, never-publish,
pending, private, wrong-authority, unknown, missing, extra, or tampered sets
stop before any publish or provenance command. Provenance is execution evidence
for the exact published output; historical attestations never select a release.
After exact publish, only `check-npm-provenance --published <file> --close-plan`
may produce the next empty snapshot, and only after every exact published
`package@version` has passed the current provenance check. There is no separate
close CLI or package script. A failed or partial publication or provenance
check retains the durable `publishing` claim on main and must be resolved by the
operator, never auto-refreshed. The same provenance command runs in a separate no-OIDC,
no-npm-credential closure job. After every exact provenance check succeeds, it
commits the canonical empty plan to a unique transition branch while requiring
the claim head to remain remote `main`, then opens a reviewed closure PR. It
never pushes protected `main` directly. Failure or head drift leaves durable
main in `publishing`; the failed run cannot overwrite release authority.
Squash-merging the plan-only closure PR restores exact empty authority. The
follow-up prepare gate recognizes the publishing-to-empty plan-only parent
transition and applies the same unique merged-PR, deterministic
`release/close-<claim>` branch, exact-head independent-approval, tree, merge,
and remote-head checks. That merge's follow-up workflow has no publishing
claim, starts no OIDC job, receives no npm token, and executes zero publish
commands. Operator
reconciliation is required before another release if either reviewed
transition is not merged.

The current committed plan is empty. Choosing versions, selecting an explicit
cohort, approving npm publication, and choosing token versus OIDC remain
operator release decisions. Dot and Dot AOT are policy-eligible here only
through their exact alternate public authority; their platform `no-publish`
mode is not platform publication authority. UI and every selected internal
dependency require explicit reviewed Changeset rows and exact planned versions;
the release guard never substitutes an npm dist-tag such as `latest` for an
internal dependency relation. Motion is a peer and remains eligible only when
an explicit reviewed Changeset selects it.

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
protected-main preservation, unique transition branches, reviewed
claim/closure merges, single-parent plan-only publish admission, head-drift
failure, and the next empty zero-publish cycle. This exact-12 implementation
has no devlog path; this
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

The later policy-credential RED proved that the ordinary workflow
`GITHUB_TOKEN` cannot establish the Administration- and ruleset-level facts
required by this contract. The source no longer falls back to that token. A
missing `HUA_GITHUB_POLICY_TOKEN`, a 403 response, any effective rule or
ruleset summary, or a partial policy response fails closed before every
privileged release action. The positive v1 contract derives bypass authority
only from classic protection's exact empty user/team/app allowances and does
not fetch ruleset details. Preflight skips that unavailable external credential
only for an ordinary empty plan; planned, publishing, and exact
closure-transition states require it. No policy secret or GitHub App was
provisioned, read, rotated, or configured by this source change.

The GitHub authority fixtures prove the protected source and reviewed
transition contracts but do not establish release readiness by themselves.
The live source policy requires the exact six app-bound checks, administrator
enforcement, linear history, force-push/deletion denial, no approval-count or
conversation-resolution gate, effective branch rules and repository/parent
ruleset summaries exactly empty, Actions review approval disabled, and the
read-only credential's ability to read every required authority field. A
transition remains stricter than an ordinary source PR: the exact merged claim
or closure head must retain a latest exact-head approval from a human GitHub
identity distinct from its author. Agent review artifacts remain canonical HUA
source-review evidence, while that transition approval is explicit publication
authority. Source tests require every live-negative shape to admit zero
privileged release actions.

Canonical initial review
`reviews/written/pr82/initial-findings-결-8276396e95e0.md` (SHA-256
`3a76f70e99cdee1e9d5eb587d16a63b0b716150ecc7d74f57f9d94c41761f065`)
found two version-boundary P2s on exact head `8aae71cc`: a partial Changesets
status could omit an explicitly selected package, and a version command could
leave an admitted source file while still writing planned authority. The
closure RED was `129 tests / 122 PASS / 7 FAIL`: three relation variants
reached a later manifest check, and consumed/unexpected source residue was
accepted. The final focused suite is `131/131 PASS`, covering UI+Motion partial
selection, missing IDs, aggregate and mismatched type semantics, neutral-row
misclassification, and consumed/unexpected source residue. Any post-version
source failure leaves the previous empty plan bytes intact; because Changesets
may already have changed manifests, the documented reviewed partial-version
recovery boundary still applies and is not presented as automatic rollback.

## Manual Analysis

| Script                | Purpose                          |
| --------------------- | -------------------------------- |
| `analyze-export.js`   | Inspect package export surfaces. |
| `dot-audit.ts`        | Run dot package audits.          |
| `generate-palette.ts` | Generate palette data.           |

Do not document private monorepo-only scripts here unless the files are present
and the command works from this public repository.
