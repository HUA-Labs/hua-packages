# @hua-labs/dot AI Guide

This guide is for AI agents and advanced operators working with
`@hua-labs/dot`. It explains how to reason about dot without overclaiming
Tailwind parity, cross-platform behavior, or motion support.

## Mental Model

`dot` is a utility-string resolver. It turns Tailwind-inspired tokens into
style data:

- `dot()` resolves tokens into a flat web style object by default.
- `dot(input, { target: "native" })` adapts supported properties to React
  Native style data and drops unsupported web-only properties.
- `dot(input, { target: "flutter" })` returns a structured Flutter recipe, not a
  Flutter widget.
- `dotMap()` separates supported state variants into explicit style maps.
- `dotExplain()` reports target support, dropped properties, and approximations.
- `@hua-labs/dot/class` can generate CSS classes for selector-like web behavior.

The package is not a general CSS engine, not a browser layout engine, and not a
promise that every Tailwind token is portable.

## Operator Rules

1. Pick the target first: web inline style, web class CSS, React Native, Flutter,
   or codegen.
2. Use `dot()` for element-local style properties that can exist as data.
3. Use `dotMap()` when the runtime needs explicit state maps.
4. Use `@hua-labs/dot/class` or normal CSS for pseudo selectors, media queries,
   group/peer-like behavior, and selector-dependent layout.
5. Use UI or motion recipes for semantic effects such as hero atmospheres,
   keyframe choreography, vignettes, and reusable motion patterns.
6. Run `dotExplain()` before claiming cross-platform support.
7. Do not add broad arbitrary token support without parser, resolver, adapter,
   capability, and test coverage.

## Choose The Right Surface

| Need                                                          | Prefer                                                     | Reason                                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| Web inline spacing, color, layout, typography                 | `dot()`                                                    | Produces plain style data.                                |
| Web hover/focus maps for component code                       | `dotMap()`                                                 | Makes states explicit.                                    |
| Web selectors, pseudo elements, group/peer, child combinators | `@hua-labs/dot/class` or CSS                               | Inline style cannot express selectors.                    |
| Responsive web classes                                        | `@hua-labs/dot/class` or app CSS                           | `dot()` only resolves one selected breakpoint at a time.  |
| React Native style objects                                    | `dot(..., { target: "native" })` or `@hua-labs/dot/native` | Unsupported web props are dropped.                        |
| Flutter integration                                           | `dot(..., { target: "flutter" })`                          | Output is a recipe for widget composition.                |
| Reusable hero/effect/motion systems                           | `@hua-labs/ui` / `@hua-labs/motion-core` recipe            | Keeps semantic effects out of primitive token parsing.    |
| Swift / Compose code output                                   | `dot-codegen` / `@hua-labs/dot/codegen`                    | Build-time code generation, not runtime style resolution. |

## Good Patterns

### Web Inline Style

```tsx
import { dot } from "@hua-labs/dot";

const style = dot("flex items-center gap-3 rounded-lg bg-white p-4 shadow-md");
```

Good fit: one element, normal properties, no selector dependency.

### Explicit State Maps

```tsx
import { dotMap } from "@hua-labs/dot";

const button = dotMap(
  "bg-white hover:bg-gray-100 focus:ring-2 disabled:opacity-50",
);
```

Good fit: your component can apply `button.base`, `button.hover`, and related
state objects intentionally.

### React Native

```tsx
import { dotExplain } from "@hua-labs/dot";

const { styles, report } = dotExplain(
  "p-4 rounded-xl shadow-lg grid grid-cols-2 blur-md",
  { target: "native" },
);
```

Do not ignore `report`. In this example, grid and filter-like properties are not
React Native style support.

### Flutter Recipe

```tsx
import { dot } from "@hua-labs/dot";

const recipe = dot("p-4 bg-blue-500 rounded-lg", { target: "flutter" });
```

The result is a structured recipe for padding, decoration, layout, text style,
and related widget composition. It is not executable Dart by itself.

### Web Class Mode

```tsx
import { dotClass, dotRunInScopeAsync } from "@hua-labs/dot/class";

const { result: html, css } = await dotRunInScopeAsync(async () => {
  const className = dotClass("p-4 hover:bg-gray-100");
  return `<button class="${className}">Save</button>`;
});
```

Use class mode when the desired output is CSS selector behavior. For SSR, scope
and flush generated CSS deliberately.

## Do Not Claim

Do not claim a token family is cross-platform just because it works on web.

Do not claim React Native support if `dotExplain()` reports dropped or
unsupported properties.

Do not claim Flutter widget support from a recipe alone. A recipe still needs a
renderer or codegen path.

`@hua-labs/dot/flutter` pre-binds `dot()`, `dotMap()`, and `dotExplain()` to
the existing Flutter recipe adapter. Its versioned wire helper produces
deterministic JSON-safe recipe data for a future Dart consumer; it does not add
a Dart package, Flutter widgets, an SDUI renderer, or runtime execution proof.
The subpath intentionally excludes the web-only `dotVariants` API and types.
The executable field contract is the exported `FlutterRecipeWireEnvelope` in
[`src/flutter-wire.ts`](https://github.com/HUA-Labs/HUA-platform/blob/main/packages/hua-dot/src/flutter-wire.ts);
do not copy its full field inventory into another guide.

Do not claim Tailwind parity. The package has broad Tailwind-inspired coverage,
but it intentionally has explicit unsupported, approximate, and recipe-only
surfaces.

Do not claim npm release state from source files. Check the registry before
saying a source package version is published.

## Common Pitfalls

### Inline Styles Cannot Express Selectors

`dot()` returns style data. It cannot represent `:hover`, `::before`, child
selectors, `group-hover`, or `peer-*` as inline style on its own.

Use `dotMap()`, class mode, component state, or normal CSS depending on the
runtime.

### Responsive Tokens Need A Surface

`dot("p-4 md:p-8", { breakpoint: "md" })` resolves one breakpoint selection.
It does not emit media queries.

For media-query CSS, use class mode or app CSS.

### Some Web Features Are Not Mobile Style Data

CSS grid, filters, backdrop filters, transitions, animations, cursor,
selection, and many scroll/table/list behaviors are web-first. React Native may
drop them. Flutter may represent some as recipe-only or plugin-backed.

Check `dotExplain()` and the capability matrix.

### Arbitrary Values Are Guarded

Arbitrary values exist, but unsafe values are rejected. Do not bypass this guard
with string concatenation or untrusted user input.

### Class Mode Is Still A CSS Surface

Class mode can express selector behavior, but it also introduces CSS generation
and SSR concerns. Use `dotRunInScope`, `dotRunInScopeAsync`, `dotFlush`, and
`dotReset` intentionally.

### Motion Belongs At The Right Layer

Primitive animation tokens may resolve for web, but reusable motion systems
should usually be semantic recipes in `@hua-labs/motion-core` or
`@hua-labs/ui`. Do not force site-specific hero choreography into dot core
unless the parser, adapter, accessibility, and fallback semantics are reviewed.

## Troubleshooting

| Symptom                                            | Check                                              | Likely fix                                                                 |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------- |
| Style missing on native                            | `dotExplain(input, { target: "native" })`          | Replace unsupported web token or provide native component logic.           |
| Responsive class does not change at viewport width | Are you using `dot()`?                             | Use class mode or CSS media queries.                                       |
| Hover/focus token does nothing                     | Are you applying only `dot()` base style?          | Use `dotMap()` or class mode.                                              |
| Grid/flex layout differs by target                 | Capability report and adapter output               | Keep layout primitive, or write target-specific composition.               |
| Flutter output is hard to apply                    | Is it a recipe, not a widget?                      | Add a renderer/codegen path or map recipe sections manually.               |
| Flutter wire output needs transport                | `@hua-labs/dot/flutter` wire helper and schema     | Serialize the v1 recipe envelope; validate it in the future Dart consumer. |
| Unknown token warning appears                      | Source token not recognized by resolver/class mode | Replace token, add reviewed support, or move to CSS/recipe layer.          |
| Prettier changes package doc templates incorrectly | `scripts/templates/*.hbs`                          | Use `pnpm generate:docs --validate` as the correctness gate.               |

## Verification Checklist For Agents

Before reporting that a dot change is safe:

1. Run focused tests for the changed resolver, parser, adapter, class mode, or
   codegen path.
2. Check at least one supported input and one unsupported or approximate input.
3. Verify web output and at least one non-web target when making
   cross-platform claims.
4. Confirm `dotExplain()` and capability metadata match adapter behavior.
5. Run `pnpm generate:docs --validate` when package docs or templates change.
6. Run `npm pack --dry-run --json` when package artifact contents change.

## Release Boundary

This repository can contain a source candidate that is newer than public npm.
Before making public-package claims, verify:

```bash
npm view @hua-labs/dot version time.modified --json
```

Package artifact changes should be verified with:

```bash
cd packages/hua-dot && npm pack --dry-run --json
```

Do not infer public release state from `package.json` alone.
