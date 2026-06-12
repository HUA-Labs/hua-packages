---
title: "HUA Packages Public Docs Surface Inventory - 2026-06-12"
type: report
status: active
updated: 2026-06-12
mission: M541
repo: hua-packages
tags:
  - docs
  - public-repo
  - package-docs
  - ssot
  - validator-plan
---

# HUA Packages Public Docs Surface Inventory - 2026-06-12

> Scope: public `hua-packages` docs surface inventory and validator plan.
> Non-action: no package runtime/source behavior mutation, no generated README
> hand edits, no broad README rewrite, no version/changelog/changeset/lockfile
> mutation, no publish or publish dry-run.

## Executive Summary

The public docs surface is coherent enough to keep using the current
`doc.yaml`-driven generator, but it needs a second pass focused on coverage and
reader shape rather than broad rewriting.

Current state:

- Root `README.md` and `scripts/README.md` are present and public-repo oriented.
- `pnpm generate:docs:validate` passes for all 15 generator-owned package docs.
- Relative markdown link probe found no broken local links in root/package/AI
  docs.
- Three generator-owned packages lack `DETAILED_GUIDE.md`:
  `eslint-plugin-i18n`, `hua-hooks`, and `hua-utils`.
- Two package directories are intentionally outside the current generator
  because they have no `doc.yaml`: `hua-dot-lsp` and `hua-dot-mcp`.
- The largest first-run readability issue is noisy API tables in generated
  READMEs for broad export packages, especially `motion-core`, `ui`, `hua`,
  `dot`, `security`, and `utils`.

Recommended next move: add a narrow docs-surface validator in a later slice that
reports missing guides, generator ownership, AI-doc coverage, local link health,
and oversized generated API tables. Then run package-specific repair slices
instead of editing generated READMEs by hand.

## Inventory Method

Commands and probes run from `/home/devin/hua-packages` on branch
`docs/m541-hua-packages-public-docs-surface`, based on
`origin/chore/public-repo-docs-surface-cleanup`:

```bash
pnpm install --frozen-lockfile
pnpm generate:docs:validate
```

Additional read-only probes inspected:

- package directories under `packages/*`;
- presence of `doc.yaml`, `README.md`, and `DETAILED_GUIDE.md`;
- root `ai-docs/*.ai.yaml` coverage;
- relative markdown links in root/package docs and AI docs;
- generated README API table size and quick-start presence;
- public wording risk samples.

## Generator Ownership

The generator discovers package directories only when both `package.json` and
`doc.yaml` exist. For those packages, it owns:

- `packages/<package>/README.md`;
- `ai-docs/<short-name>.ai.yaml`.

Validation result:

```text
pnpm generate:docs:validate
Result: 15 valid, 0 drifted
```

Generator-owned packages:

| Package dir             | README    | AI doc                       | Detailed guide |
| ----------------------- | --------- | ---------------------------- | -------------- |
| `create-hua`            | generated | `create-hua.ai.yaml`         | present        |
| `eslint-plugin-i18n`    | generated | `eslint-plugin-i18n.ai.yaml` | missing        |
| `hua`                   | generated | `hua.ai.yaml`                | present        |
| `hua-dot`               | generated | `dot.ai.yaml`                | present        |
| `hua-dot-aot`           | generated | `dot-aot.ai.yaml`            | present        |
| `hua-hooks`             | generated | `hooks.ai.yaml`              | missing        |
| `hua-i18n-core`         | generated | `i18n-core.ai.yaml`          | present        |
| `hua-i18n-core-zustand` | generated | `i18n-core-zustand.ai.yaml`  | present        |
| `hua-i18n-formatters`   | generated | `i18n-formatters.ai.yaml`    | present        |
| `hua-i18n-loaders`      | generated | `i18n-loaders.ai.yaml`       | present        |
| `hua-motion-core`       | generated | `motion-core.ai.yaml`        | present        |
| `hua-security`          | generated | `security.ai.yaml`           | present        |
| `hua-state`             | generated | `state.ai.yaml`              | present        |
| `hua-ui`                | generated | `ui.ai.yaml`                 | present        |
| `hua-utils`             | generated | `utils.ai.yaml`              | missing        |

Manual docs outside the generator:

| Package dir   | Current docs                                               | Classification      |
| ------------- | ---------------------------------------------------------- | ------------------- |
| `hua-dot-lsp` | `README.md`, `DETAILED_GUIDE.md`, no `doc.yaml`, no AI doc | manual package docs |
| `hua-dot-mcp` | `README.md`, `DETAILED_GUIDE.md`, no `doc.yaml`, no AI doc | manual package docs |

Decision needed later: either keep LSP/MCP as manual docs and teach the
validator not to require AI docs for them, or add `doc.yaml` and bring them
under the generator in a dedicated slice.

## Package Surface Table

| Package                 | README lines | Guide lines | `doc.yaml` lines | README API rows | Quick start | Initial classification              |
| ----------------------- | -----------: | ----------: | ---------------: | --------------: | ----------- | ----------------------------------- |
| `create-hua`            |           48 |        1275 |               28 |               1 | yes         | guide-heavy CLI docs                |
| `eslint-plugin-i18n`    |           78 |           0 |               50 |               0 | yes         | missing detailed guide              |
| `hua`                   |          215 |          86 |              296 |              60 | yes         | noisy generated API table           |
| `hua-dot`               |          218 |         826 |              186 |              51 | yes         | broad API table, strong guide       |
| `hua-dot-aot`           |           64 |         625 |               52 |               5 | yes         | healthy                             |
| `hua-dot-lsp`           |          183 |         328 |                0 |               0 | no          | manual docs, no generator ownership |
| `hua-dot-mcp`           |          255 |         477 |                0 |               4 | no          | manual docs, no generator ownership |
| `hua-hooks`             |           68 |           0 |               36 |               9 | yes         | missing detailed guide              |
| `hua-i18n-core`         |          103 |          97 |               83 |              24 | yes         | moderate API table                  |
| `hua-i18n-core-zustand` |           74 |          89 |               44 |               2 | yes         | healthy                             |
| `hua-i18n-formatters`   |           95 |         112 |              146 |              29 | yes         | moderate API table                  |
| `hua-i18n-loaders`      |           80 |          95 |               46 |              10 | yes         | healthy                             |
| `hua-motion-core`       |          179 |         827 |              366 |             104 | yes         | very noisy generated API table      |
| `hua-security`          |          108 |         413 |               89 |              41 | yes         | noisy generated API table           |
| `hua-state`             |           85 |          35 |               90 |              14 | yes         | thin guide                          |
| `hua-ui`                |          145 |        2691 |              329 |              83 | yes         | very noisy generated API table      |
| `hua-utils`             |           93 |           0 |              139 |              32 | yes         | missing guide and noisy API table   |

## Link And Backlink Probe

The initial relative markdown link probe found no broken local links across:

- root `README.md`;
- `scripts/README.md`;
- package `README.md`;
- package `DETAILED_GUIDE.md`;
- root `ai-docs/*.ai.yaml`.

This should become a repeatable validator check because it is cheap and
directly protects the public repo front door.

## Public Wording Risk

Most wording hits are acceptable public docs, not blockers:

- root README states the root package is `private` while publishable packages
  live under `packages/`;
- `scripts/README.md` explicitly excludes private monorepo-only scripts;
- `create-hua` documents AI context and Claude/Codex options because those are
  product features;
- dot docs use "internal" to explain implementation markers and helper modules;
- `i18n-loaders` documents localhost as a local dev fallback.

Recommendation: do not bulk-rewrite these terms. The validator should report
private wording as a review queue, not fail by default. Only exact private repo
path/name leaks such as `hua-platform`, `sum-diary`, private docs paths, or
nonexistent private scripts should fail.

## Noisy Generated API Tables

The generated README template always emits an API table from parsed exports.
This is useful for small packages but becomes noisy for broad packages.

Highest-priority noisy tables:

| Package           | API rows | Recommended treatment                                                                                             |
| ----------------- | -------: | ----------------------------------------------------------------------------------------------------------------- |
| `hua-motion-core` |      104 | switch `doc.yaml` to curated `apiNotes` / `apiFilter: notes-only`, then point deep details to `DETAILED_GUIDE.md` |
| `hua-ui`          |       83 | curate public entry points and move component breadth into guide/docs site                                        |
| `hua`             |       60 | curate umbrella exports; keep quick-start first                                                                   |
| `hua-dot`         |       51 | keep README focused on primary `dot` usage; guide can hold the matrix                                             |
| `hua-security`    |       41 | curate alpha/security surface carefully                                                                           |
| `hua-utils`       |       32 | add guide and curate utility categories                                                                           |

Do not hand-edit generated README tables. Change `doc.yaml` and generator
settings in package-specific repair slices.

## Missing Or Thin Guides

Missing `DETAILED_GUIDE.md`:

- `packages/eslint-plugin-i18n`
- `packages/hua-hooks`
- `packages/hua-utils`

Thin guide:

- `packages/hua-state/DETAILED_GUIDE.md` is 35 lines and likely too thin for
  the public package surface.

Recommended first guide repair order:

1. `eslint-plugin-i18n`: public adoption path needs rules, flat config, legacy
   config, CLI examples, and troubleshooting in one durable guide.
2. `hua-utils`: broad utility package with a noisy generated API table needs
   grouped examples and migration notes.
3. `hua-hooks`: shared hooks package needs hook categories and minimal examples.
4. `hua-state`: expand guide if the package remains a public support surface.

## Validator Plan

Add a narrow report-only checker in a later slice, for example:

```bash
pnpm docs:surface:check
```

Suggested implementation:

- script path: `scripts/check-docs-surface.ts`;
- no writes by default;
- deterministic stdout table plus nonzero exit only for hard failures;
- optional JSON output later if needed.

Checks:

1. Generator ownership:
   - packages with `doc.yaml` must have generated README and matching AI doc;
   - `pnpm generate:docs:validate` remains the source of truth for drift.
2. Guide coverage:
   - warn when a package lacks `DETAILED_GUIDE.md`;
   - warn when a guide is below a line-count threshold such as 80 lines;
   - allow explicit exceptions for intentionally small packages.
3. Manual package docs:
   - report packages with README/guide but no `doc.yaml`;
   - do not fail until the team decides whether they should join the generator.
4. Link health:
   - fail broken relative markdown links;
   - ignore `http`, `https`, `mailto`, and pure anchors initially;
   - later add heading-anchor validation if needed.
5. API table size:
   - warn when generated README API rows exceed a threshold such as 30;
   - recommend `apiFilter: notes-only` or curated `apiNotes`.
6. Public wording risk:
   - warn on review terms such as private/internal/monorepo;
   - fail only exact private repo/app references if they appear in public docs.

This checker should not generate docs, mutate README files, or replace
`generate:docs:validate`.

## Recommended Follow-Up Slices

1. `eslint-plugin-i18n` guide slice:
   - add `DETAILED_GUIDE.md`;
   - keep README generated from `doc.yaml`;
   - include flat config, legacy config, CLI, and troubleshooting.
2. `hua-utils` guide/API curation slice:
   - add `DETAILED_GUIDE.md`;
   - reduce generated README noise through `doc.yaml` curation.
3. `hua-hooks` guide slice:
   - add hook categories and examples.
4. `motion-core` and `ui` API table curation:
   - use `apiFilter: notes-only` or curated `apiNotes` if the generated table
     is too broad for first-run public docs.
5. LSP/MCP generator decision:
   - either add `doc.yaml` and AI docs, or formally classify them as manual
     docs with validator exceptions.

## Verification

Passed:

- `pnpm install --frozen-lockfile`
- `pnpm generate:docs:validate`
  - 15 valid
  - 0 drifted
- read-only local link probe
  - broken relative markdown links: 0
- read-only package surface inventory

Not run:

- `pnpm generate:docs`
- package build/type-check/test/lint
- publish or publish dry-run
- versioning, changesets, changelog, or lockfile mutation

## Residual Risk

- The link probe does not validate heading anchors yet.
- Public wording classification is intentionally conservative and needs human
  review before it becomes a failing check.
- This inventory does not repair package docs; it defines the map and follow-up
  slices.
