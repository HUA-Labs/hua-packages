---
title: "hua-packages Publish Artifact Hygiene Gate"
type: report
status: ready-for-review
updated: 2026-06-12
mission: M542
agent: 윤
tags:
  - packages
  - publish-readiness
  - artifact-gate
  - public-repo
  - type-entries
  - payload
---

# hua-packages Publish Artifact Hygiene Gate

## Summary

`hua-packages` main is not publish-ready yet.

The repo is healthy enough for docs/build/type/lint and non-UI package tests,
but it still has three publish blockers:

1. `@hua-labs/ui` full tests fail and remain owned by M540.
2. Several packed artifacts reference declaration files that are not present in
   the `.tgz`.
3. Several packed artifacts include source, tests, or `.turbo` files that need a
   package-specific payload policy before release.

There is also no versioning delta: every local package version matches npm
latest and `pnpm changeset status` reports no pending bump.

## Current Green Gates

Run from `/home/devin/hua-packages` on branch
`docs/m542-publish-artifact-hygiene-gate`.

| Gate                                                                                               | Result                    |
| -------------------------------------------------------------------------------------------------- | ------------------------- |
| `pnpm generate:docs:validate`                                                                      | PASS: 15 valid, 0 drifted |
| `pnpm build`                                                                                       | PASS                      |
| `pnpm type-check`                                                                                  | PASS                      |
| `pnpm lint`                                                                                        | PASS with warnings only   |
| `pnpm exec turbo run test --filter=!@hua-labs/ui`                                                  | PASS: 26 tasks            |
| `pnpm --recursive --filter './packages/*' pack --pack-destination /tmp/m542-pack-artifacts --json` | PASS: 17 tarballs created |

## Current Blockers

### M540 UI Test Blocker

`pnpm --filter @hua-labs/ui test -- --run --reporter=dot` fails:

- Test files: 47 failed, 63 passed, 110 total.
- Tests: 211 failed, 1342 passed, 1553 total.

Most failures still look like stale class-name or style-shape assertions against
the current dot/inline/generated style output. M542 does not repair those tests;
M540 owns the UI test modernization lane.

### Packed Artifact Checker

M542 adds a narrow mechanical checker:

```bash
pnpm check:pack-artifacts /tmp/m542-pack-artifacts/*.tgz
```

The checker inspects packed `.tgz` artifacts for:

- missing root `types`, `typings`, or nested `exports.*.types` references;
- unresolved `workspace:*` dependency specs in packed `package.json`;
- unintended `src/**`, `__tests__`, `*.test.*`, or `.turbo/**` payload.

The checker intentionally fails on current main because the repo is not
publish-ready.

### Missing Type References

| Package                   | Missing packed type references                                                    |
| ------------------------- | --------------------------------------------------------------------------------- |
| `@hua-labs/dot-aot@0.1.0` | `package/dist/index.d.ts`, `package/dist/vite.d.ts`, `package/dist/babel.d.ts`    |
| `@hua-labs/hooks@1.1.4`   | `package/dist/index.d.ts`                                                         |
| `@hua-labs/state@1.0.4`   | `package/dist/index.d.ts`, `package/dist/integrations/i18n.d.ts`                  |
| `@hua-labs/ui@2.3.0`      | `package/dist/native.d.ts`, `package/dist/sdui.d.ts`, `package/dist/landing.d.ts` |
| `@hua-labs/utils@1.1.4`   | `package/dist/index.d.ts`                                                         |

The common shape is package metadata pointing at `.d.ts` while the packed
artifact emits only `.d.mts` for those entries. Do not publish these packages
until their package metadata and build outputs agree.

### Payload Hygiene Issues

| Package                             | Checker classification                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `@hua-labs/dot-lsp@0.1.0`           | Packs `.turbo/**`, `src/**`, and test files.                                                    |
| `@hua-labs/dot-mcp@0.1.0`           | Packs `.turbo/**`, `src/**`, and test files.                                                    |
| `@hua-labs/hua@1.2.1`               | Packs broad `src/**` and many tests; `.hua-agent-docs/**` is explicitly allowed by the checker. |
| `@hua-labs/i18n-core@2.2.0`         | Packs `src/**` and tests.                                                                       |
| `@hua-labs/i18n-core-zustand@2.2.0` | Packs `src/**` and tests.                                                                       |
| `@hua-labs/i18n-formatters@2.2.0`   | Packs `src/**` and tests.                                                                       |
| `@hua-labs/i18n-loaders@2.2.0`      | Packs `src/**` and tests.                                                                       |
| `@hua-labs/state@1.0.4`             | Packs `src/**` and tests, plus missing type refs.                                               |

Allowed source-like payloads in the checker:

- `create-hua` template files under `package/templates/**`.
- `@hua-labs/hua` agent docs under `package/.hua-agent-docs/**`.
- `@hua-labs/ui` public style/icon source payload under
  `package/src/styles/**`, `package/src/components/icons/**`, and
  `package/src/components/icons-bold/**`.

Those allowlist entries are not release approval by themselves; they only keep
the checker focused on known intended public payload shapes.

## Registry And Versioning State

All local package versions match npm latest:

| Package                        | Local           | npm latest      |
| ------------------------------ | --------------- | --------------- |
| `create-hua`                   | `1.4.0`         | `1.4.0`         |
| `@hua-labs/dot`                | `0.1.0`         | `0.1.0`         |
| `@hua-labs/dot-aot`            | `0.1.0`         | `0.1.0`         |
| `@hua-labs/dot-lsp`            | `0.1.0`         | `0.1.0`         |
| `@hua-labs/dot-mcp`            | `0.1.0`         | `0.1.0`         |
| `@hua-labs/eslint-plugin-i18n` | `0.1.2`         | `0.1.2`         |
| `@hua-labs/hooks`              | `1.1.4`         | `1.1.4`         |
| `@hua-labs/hua`                | `1.2.1`         | `1.2.1`         |
| `@hua-labs/i18n-core`          | `2.2.0`         | `2.2.0`         |
| `@hua-labs/i18n-core-zustand`  | `2.2.0`         | `2.2.0`         |
| `@hua-labs/i18n-formatters`    | `2.2.0`         | `2.2.0`         |
| `@hua-labs/i18n-loaders`       | `2.2.0`         | `2.2.0`         |
| `@hua-labs/motion-core`        | `2.4.1`         | `2.4.1`         |
| `@hua-labs/security`           | `1.0.0-alpha.1` | `1.0.0-alpha.1` |
| `@hua-labs/state`              | `1.0.4`         | `1.0.4`         |
| `@hua-labs/ui`                 | `2.3.0`         | `2.3.0`         |
| `@hua-labs/utils`              | `1.1.4`         | `1.1.4`         |

`pnpm changeset status` reports no packages to bump at patch, minor, or major.
Any release action still needs an explicit versioning/changeset mission after
the artifact blockers are repaired.

## Clean Tarball Shape Candidates

The checker passes these current tarballs:

- `create-hua@1.4.0`
- `@hua-labs/dot@0.1.0`
- `@hua-labs/eslint-plugin-i18n@0.1.2`
- `@hua-labs/motion-core@2.4.1`
- `@hua-labs/security@1.0.0-alpha.1`

These are not publish recommendations. They simply have no M542 checker issues
on current artifacts. They still need versioning delta, release notes, package
specific gates, and operator approval before publish.

## Recommended Follow-Up Order

1. M540: finish `@hua-labs/ui` test modernization before any UI or umbrella
   package release.
2. Fix type-entry drift for `@hua-labs/hooks`, `@hua-labs/state`,
   `@hua-labs/utils`, `@hua-labs/dot-aot`, and `@hua-labs/ui`.
3. Tighten package `files` payloads for `dot-lsp`, `dot-mcp`, i18n packages,
   `state`, and umbrella `hua`.
4. Decide whether `@hua-labs/hua` intentionally publishes broad source as
   public framework documentation/source, or whether it should ship dist plus
   explicit docs only.
5. After blockers are fixed, open package-specific final gates with changesets
   and packed artifact evidence. Do not publish directly from M542.

## Non-Actions

- No npm publish.
- No npm publish dry-run.
- No `pnpm version-packages`.
- No package runtime/source behavior change.
- No package version, changelog, changeset, or lockfile mutation.
- No UI test modernization in this slice.
