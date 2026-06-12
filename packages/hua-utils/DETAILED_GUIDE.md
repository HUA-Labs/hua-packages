# @hua-labs/utils Detailed Guide

`@hua-labs/utils` collects small TypeScript helpers for class name merging,
formatting, async control, validation, string manipulation, and sanitization.
The package is intentionally simple: each helper is imported directly from the
root package and can be used independently.

## Installation

```bash
pnpm add @hua-labs/utils
```

The `cn` helper uses `clsx` and `tailwind-merge` internally. React is listed as
a peer dependency for compatibility with the wider package set, but the utility
functions themselves are plain TypeScript helpers.

## Class Names

Use `cn` when combining conditional class names in Tailwind-based interfaces.
It accepts the same input shapes as `clsx` and resolves conflicting Tailwind
classes with `tailwind-merge`.

```tsx
import { cn } from "@hua-labs/utils";

function Button({ active }: { active: boolean }) {
  return (
    <button className={cn("px-4 py-2 bg-blue-500", active && "bg-blue-700")}>
      Save
    </button>
  );
}
```

## Formatters

Formatting helpers cover common UI display needs.

```ts
import {
  formatDate,
  formatFileSize,
  formatNumber,
  formatTimeAgo,
} from "@hua-labs/utils";

formatDate(new Date("2026-06-12"));
formatNumber(1234567);
formatFileSize(1536);
formatTimeAgo(new Date(Date.now() - 60_000));
```

`formatDate` and `formatNumber` accept `Intl` options. `formatTimeAgo` returns
Korean relative time text for past dates.

## Async Control

Use `debounce` for input-driven work, `throttle` for repeated events, `delay`
for simple waits, `retry` for transient failures, and `memoize` for deterministic
pure functions.

```ts
import { debounce, retry } from "@hua-labs/utils";

const search = debounce((query: string) => {
  void fetchResults(query);
}, 300);

const data = await retry(
  () => fetch("/api/data").then((r) => r.json()),
  3,
  500,
);
```

Keep retries around idempotent operations. For mutations, make sure the server
can safely receive repeated attempts.

## Validation

Validation helpers return booleans or simple result objects. They are suitable
for client-side feedback and light input checks.

```ts
import {
  validateEmail,
  validateNumberRange,
  validatePassword,
  validateUrl,
} from "@hua-labs/utils";

validateEmail("hello@example.com");
validateUrl("https://hua-labs.com");
validateNumberRange(7, 1, 10);
validatePassword("correct-horse-battery-staple");
```

Client-side validation should complement server validation, not replace it.

## String Utilities

```ts
import {
  generateId,
  slugify,
  toCamelCase,
  toKebabCase,
  truncate,
} from "@hua-labs/utils";

generateId("item");
slugify("Hello HUA Labs");
toCamelCase("hello-hua-labs");
toKebabCase("helloHuaLabs");
truncate("Long display text", 12);
```

Use these helpers for display and UI identifiers. For durable identifiers that
need cross-system guarantees, prefer your storage or backend identity strategy.

## Sanitization

Sanitization helpers are intended for simple UI and logging safeguards.

```ts
import {
  escapeHtml,
  maskEmailForLog,
  sanitizeEmail,
  sanitizeInput,
  sanitizeName,
  sanitizeTitle,
} from "@hua-labs/utils";

sanitizeInput('<script>alert("xss")</script>');
sanitizeTitle("<b>Hello</b>");
sanitizeEmail(" USER@EXAMPLE.COM ");
maskEmailForLog("user@example.com");
escapeHtml("<strong>Hello</strong>");
```

Do not treat client-side sanitization as a full security boundary. Sanitize and
validate again on the server whenever data crosses a trust boundary.

## Import Style

All documented helpers are available from the root package:

```ts
import { cn, debounce, validateEmail } from "@hua-labs/utils";
```

There are no public subpath exports for this package. Keep imports at the root
so future package builds can preserve a stable public surface.

## Troubleshooting

If `cn` does not resolve a Tailwind conflict the way you expect, check whether
the class belongs to a custom Tailwind plugin that `tailwind-merge` does not
know how to group.

If a formatter output differs by environment, pass explicit `Intl` options and
avoid relying on the host default time zone for user-facing dates.

If validation accepts a value that your product should reject, wrap the helper
with product-specific constraints rather than changing all call sites.
