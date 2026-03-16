# @hua-labs/dot-lsp

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot-lsp.svg)](https://www.npmjs.com/package/@hua-labs/dot-lsp)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot-lsp.svg)](https://www.npmjs.com/package/@hua-labs/dot-lsp)
[![license](https://img.shields.io/npm/l/@hua-labs/dot-lsp.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

Language Server Protocol (LSP) server for the [@hua-labs/dot](../hua-dot) style engine.
Provides autocomplete, hover documentation, and diagnostic warnings inside any editor
that supports LSP.

## Features

### Completion

Suggests utility tokens wherever the cursor is inside a `dot(...)` call or a `dot="..."` attribute.

Trigger characters: `"` `'` `` ` `` ` ` (space) `:`

The completion list covers all token categories below, plus every base token prefixed with
each of the supported variants (`hover:`, `focus:`, `active:`, `focus-visible:`,
`focus-within:`, `disabled:`, `dark:`, `sm:`, `md:`, `lg:`, `xl:`, `2xl:`).

Results are capped at 500 items per request. `insertText` is set to the suffix after what
is already typed, so completion works incrementally.

### Hover

Hovering a utility token inside a `dot(...)` or `dot="..."` string shows a Markdown popup
with the token name and the CSS property/value it resolves to.

```
**p-4**

`padding: 16px`
```

If the token is not in the built-in list, the server attempts to resolve it through the dot
engine directly. The popup is omitted if the engine produces no output.

### Diagnostics

On every file open and every content change, the server scans all `dot(...)` / `dot="..."`
regions and emits a **warning** diagnostic for each token that:

1. Is not in the built-in completion list, and
2. Cannot be resolved by the dot engine.

Variant prefixes (`hover:`, `dark:`, etc.) and the `!` important prefix are stripped before
the check so that `hover:p-4` does not produce a false positive.

Source identifier in all diagnostics: `dot-lsp`

## Recognized syntax patterns

| Pattern         | Example                      |
| --------------- | ---------------------------- |
| `dot("...")`    | `dot("p-4 rounded-lg")`      |
| `dot('...')`    | `dot('flex gap-2')`          |
| ``dot(`...`)``  | ``dot(`text-lg font-bold`)`` |
| `dot="..."`     | `<Box dot="bg-white p-4">`   |
| `dot='...'`     | `<Box dot='text-sm'>`        |
| `dot={"..."}`   | `<Box dot={"sr-only"}>`      |
| `dot={'...'}`   | `<Box dot={'capitalize'}>`   |
| ``dot={`...`}`` | ``<Box dot={`flex`}>``       |

## Token coverage

| Category          | Example tokens                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Spacing           | `p-4`, `mx-auto`, `gap-2`, `space-y-4`                                                         |
| Color             | `bg-white`, `text-primary`, `border-slate-200`, `ring-cyan-500`                                |
| Sizing            | `w-full`, `h-screen`, `max-w-prose`, `min-h-0`                                                 |
| Typography        | `text-lg`, `font-bold`, `font-sans`, `leading-tight`, `tracking-wide`, `uppercase`, `truncate` |
| Layout / position | `flex`, `grid`, `hidden`, `relative`, `absolute`, `z-10`, `overflow-hidden`                    |
| Flexbox           | `flex-col`, `items-center`, `justify-between`, `flex-1`, `flex-wrap`                           |
| Grid              | `grid-cols-2`, `col-span-3`, `row-start-1`, `auto-rows-fr`                                     |
| Border            | `rounded-lg`, `border`, `border-2`, `divide-y`, `ring-2`                                       |
| Shadow            | `shadow`, `shadow-lg`, `shadow-none`                                                           |
| Background        | `bg-cover`, `bg-center`, `bg-no-repeat`                                                        |
| Transition        | `transition`, `transition-colors`, `duration-300`, `ease-in-out`, `ease-spring`                |
| Animation         | `animate-spin`, `animate-pulse`, `animate-bounce`, `animate-ping`, `animate-none`              |
| Transform         | `scale-100`, `rotate-45`, `translate-x-4`, `origin-center`, `skew-x-3`                         |
| Filter            | `blur`, `blur-lg`, `brightness-90`, `grayscale`, `backdrop-blur-md`, `drop-shadow`             |
| Interactivity     | `cursor-pointer`, `select-none`, `pointer-events-none`, `resize`, `sr-only`                    |

Semantic color tokens (e.g. `bg-primary`, `text-muted-foreground`) are included and resolve
to CSS custom property values (`var(--color-primary)`).

## Installation

```bash
npm install -g @hua-labs/dot-lsp
```

Or install locally and reference the binary from your editor configuration:

```bash
npm install --save-dev @hua-labs/dot-lsp
```

The binary name is `dot-lsp`.

## Editor configuration

### VS Code — manual configuration

Install the [generic LSP client extension](https://marketplace.visualstudio.com/items?itemName=mattn.vscode-lsp-client)
or configure via `settings.json` if you already have a multi-LSP extension:

```json
{
  "lsp.servers": [
    {
      "name": "dot-lsp",
      "command": ["dot-lsp", "--stdio"],
      "filetypes": [
        "typescript",
        "typescriptreact",
        "javascript",
        "javascriptreact"
      ]
    }
  ]
}
```

### Neovim — nvim-lspconfig

```lua
local lspconfig = require("lspconfig")
local configs = require("lspconfig.configs")

if not configs.dot_lsp then
  configs.dot_lsp = {
    default_config = {
      cmd = { "dot-lsp", "--stdio" },
      filetypes = { "typescript", "typescriptreact", "javascript", "javascriptreact" },
      root_dir = lspconfig.util.root_pattern("package.json", ".git"),
    },
  }
end

lspconfig.dot_lsp.setup({})
```

### Helix — `languages.toml`

```toml
[[language]]
name = "typescript"
language-servers = ["typescript-language-server", "dot-lsp"]

[language-server.dot-lsp]
command = "dot-lsp"
args = ["--stdio"]
```

## Running manually

```bash
dot-lsp --stdio
```

The server communicates over stdin/stdout following the LSP specification.
Node.js 20 or later is required.

## Requirements

- Node.js >= 20.0.0
- `@hua-labs/dot` (peer, resolved automatically when installed via npm)

## Related Packages

- [`@hua-labs/dot`](https://www.npmjs.com/package/@hua-labs/dot) — Core style engine
- [`@hua-labs/dot-vscode`](https://marketplace.visualstudio.com/items?itemName=hua-labs.dot-vscode) — VS Code extension (uses this LSP)
- [`@hua-labs/dot-aot`](https://www.npmjs.com/package/@hua-labs/dot-aot) — Build-time static extraction
- [`@hua-labs/dot-mcp`](https://www.npmjs.com/package/@hua-labs/dot-mcp) — MCP server for AI assistants

## License

MIT — [HUA Labs](https://hua-labs.com)
