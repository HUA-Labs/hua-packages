# @hua-labs/dot-lsp Detailed Guide

LSP server for the @hua-labs/dot style engine.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Installation & Setup](#installation--setup)
3. [Core Concepts](#core-concepts)
4. [Editor Configuration](#editor-configuration)
5. [Advanced Usage](#advanced-usage)
6. [Troubleshooting](#troubleshooting)

---

## Architecture

### LSP Protocol

`@hua-labs/dot-lsp` implements the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) specification. It operates as a standalone server process that any LSP-capable editor can connect to, decoupling the dot style intelligence from any specific editor extension.

### Transport

The server uses **stdio transport** exclusively. It reads LSP messages from `stdin` and writes responses to `stdout`. This is the standard transport for LSP servers invoked as a subprocess by an editor client.

```
Editor (client) ──stdin──▶ dot-lsp ──stdout──▶ Editor (client)
```

No TCP socket or pipe configuration is needed. The editor spawns the process and wires up the streams automatically.

### Providers

The server exposes three capabilities:

| Provider    | LSP Method                        | Trigger                   |
| ----------- | --------------------------------- | ------------------------- |
| Completion  | `textDocument/completion`         | `"` `'` `` ` `` space `:` |
| Hover       | `textDocument/hover`              | Cursor over a token       |
| Diagnostics | `textDocument/publishDiagnostics` | File open, file change    |

**Completion provider** — Scans the cursor position to determine whether it is inside a `dot(...)` call or `dot="..."` attribute. If so, it returns matching utility tokens from the package-local catalog. The response is capped at 500 items per request. `insertText` is set to only the suffix of the token that has not yet been typed, enabling incremental completion without duplicating already-typed characters. Every catalogued base token is also expanded with each supported variant prefix, so the list covers `hover:p-4`, `dark:bg-white`, etc.

**Hover provider** — Resolves the token under the cursor and returns a Markdown popup showing the token name and its CSS output. If the token is not in the package-local catalog, resolution falls back to the dot engine directly. No popup is shown when the engine produces no output.

**Diagnostics provider** — Runs on every `textDocument/didOpen` and `textDocument/didChange` event. It scans all dot regions in the file and emits a `Warning` diagnostic for every token that is both absent from the package-local completion catalog and unresolvable by the dot engine. Variant prefixes and the `!` important prefix are stripped before the check to avoid false positives on valid qualified tokens.

### Completion Catalog Ownership

The completion provider uses a package-local bounded hand-maintained completion catalog. Its constants and entry builders are maintained in the Dot LSP package and bundled into the server. They are not generated from the current `@hua-labs/dot` engine during build, do not represent complete engine coverage, and are not resolver or target-support authority. The direct Dot runtime dependency remains the fallback authority used by hover and diagnostics for tokens outside the catalog.

### Initialize Identity

The LSP initialize response includes a manifest-derived initialize server identity: name `dot-lsp` plus the exact package-manifest version bundled by the build. The value is validated and frozen by the package's internal server-info module. This protocol identity does not create a JavaScript import API; the supported public surface remains the `dot-lsp --stdio` binary and LSP protocol.

---

## Installation & Setup

### Global Install

Install globally to make the `dot-lsp` binary available on your `PATH`:

```bash
npm install -g @hua-labs/dot-lsp
```

After installation, verify the binary is reachable:

```bash
dot-lsp --stdio
# Server starts and waits for LSP messages on stdin
```

Press `Ctrl+C` to exit.

### Local Install

Install as a dev dependency if you prefer to pin the version per project:

```bash
npm install --save-dev @hua-labs/dot-lsp
```

When using a local install, reference the binary by its full path in your editor configuration:

```
./node_modules/.bin/dot-lsp
```

or via `npx`:

```bash
npx dot-lsp --stdio
```

### Binary Name

The executable is named **`dot-lsp`** regardless of install method. All editor configuration examples below use this name and assume it is on `PATH`. Substitute the full path if using a local install.

### Direct Runtime Dependency

`@hua-labs/dot` is a direct runtime dependency of `@hua-labs/dot-lsp`. Package installation resolves it through the package dependency graph; consumers do not need to supply it separately. Hover fallback and diagnostic resolution call that installed dependency when a token is outside the package-local catalog.

---

## Core Concepts

### Recognized Syntax Patterns

The server identifies dot regions using the following patterns:

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

Completion and diagnostics are active only inside these recognized regions. Tokens written outside of them are ignored.

### Completion Catalog Categories

The package-local completion catalog covers the following categories:

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

Semantic color tokens such as `bg-primary` and `text-muted-foreground` are included and resolve to CSS custom property values (e.g. `var(--color-primary)`).

### Variant Handling

Every base token in the package-local catalog is also offered as a completion item prefixed with each of the supported variants:

```
hover:   focus:   active:   focus-visible:   focus-within:
disabled:   dark:   sm:   md:   lg:   xl:   2xl:
```

During diagnostics, variant prefixes are stripped before the unknown-token check. This means `hover:p-4` is validated as `p-4` and does not produce a warning if `p-4` is a known token.

The `!` important prefix is also stripped before validation, so `!p-4` is checked as `p-4`.

### Diagnostic Source Identifier

All diagnostic messages emitted by the server carry the source identifier **`dot-lsp`**. Editors that allow filtering diagnostics by source use this string. The severity level is always `Warning` — the server never emits errors or information-level diagnostics for unknown tokens.

### Target Caveat Diagnostics

By default, `dot-lsp` validates only token recognition and CSS-only variant
usage. If an LSP client supplies a target, diagnostics also include target
capability caveats from `dotExplain()`:

```json
{
  "initializationOptions": {
    "dot": {
      "target": "native"
    }
  }
}
```

Supported target values are `"web"`, `"native"`, and `"flutter"`. Invalid or
missing target values are ignored, preserving the no-target diagnostic path.
Clients may also send `workspace/didChangeConfiguration` with either
`{ "target": "native" }` or `{ "dot": { "target": "native" } }`; open
documents are revalidated after the setting changes.

When a caveat property is covered by the package-owned `@hua-labs/dot` AX
catalog, the diagnostic appends the AX family label and category. For example,
`filter=unsupported` may be shown as `filter=unsupported (Filter,
visual-effect)`. This is editor/AI diagnostic context only; it does not change
resolver output, target adapters, VS Code runtime behavior, or platform
support.

---

## Editor Configuration

### VS Code — Manual Configuration

There is no dedicated VS Code extension required for basic LSP usage. Install a generic LSP client extension such as [vscode-lsp-client](https://marketplace.visualstudio.com/items?itemName=mattn.vscode-lsp-client), then add the following to your `settings.json`:

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

If you are already using a multi-LSP extension (such as `neovim.vscode-neovim` or a custom LSP bridge), adapt the server entry to match that extension's configuration schema. The key values that must be preserved are:

- **command:** `["dot-lsp", "--stdio"]`
- **filetypes:** the four TS/JS file types listed above
- **initializationOptions.dot.target:** optional `"web"`, `"native"`, or
  `"flutter"` for target caveat diagnostics

The repository also contains first-party VSIX source (`dot-vscode`) that can bundle this LSP server. Its release classification is `channel-pending` with unresolved distribution authority. This package does not claim Marketplace availability or a prebuilt VSIX. Building or packaging that source locally is separate from installing a published editor extension.

### Neovim — nvim-lspconfig

`dot-lsp` is not part of the official `nvim-lspconfig` server registry, so you must register it as a custom config before calling `setup`:

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

lspconfig.dot_lsp.setup({
  init_options = {
    dot = {
      target = "native",
    },
  },
})
```

Place this block in your Neovim config after `lspconfig` is loaded. The `root_dir` pattern anchors the server to the nearest `package.json` or `.git` directory, which is the standard convention for JavaScript/TypeScript projects.

You can pass additional options to `setup({})` as you would for any other lspconfig server — for example, attaching keymaps via `on_attach` or overriding capabilities.

### Helix — languages.toml

Add `dot-lsp` alongside your existing TypeScript language server in `~/.config/helix/languages.toml`:

```toml
[[language]]
name = "typescript"
language-servers = ["typescript-language-server", "dot-lsp"]

[language-server.dot-lsp]
command = "dot-lsp"
args = ["--stdio"]
```

Repeat the `[[language]]` block for `javascript`, `tsx`, and `jsx` if you want coverage in those file types as well. Helix supports multiple language servers per language natively — `dot-lsp` runs alongside `typescript-language-server` without conflict.

---

## Advanced Usage

### Running Manually

You can start the server directly from the command line to verify it is installed and working:

```bash
dot-lsp --stdio
```

The server starts and blocks, waiting for LSP messages on `stdin`. It will not print anything until it receives a valid `initialize` request. This is expected behavior — the server is not interactive.

### Integration with Custom Editors

Any editor or tool that can spawn a subprocess and communicate over stdio using the LSP protocol can use `dot-lsp`. The minimum LSP handshake is:

1. Client sends `initialize` request with `capabilities`.
2. Server replies with `InitializeResult` advertising completion, hover, and diagnostics support plus its manifest-derived name/version identity.
3. Client sends `initialized` notification.
4. Client sends `textDocument/didOpen` to begin receiving diagnostics.

The server advertises the following trigger characters for completion: `"` `'` `` ` `` ` ` (space) `:`

No custom LSP extensions or non-standard methods are used. Any spec-compliant LSP client implementation should work without modification.

### Debugging LSP Communication

To inspect the raw JSON-RPC messages exchanged between your editor and the server, use a logging proxy. One approach is to wrap the server with a script that tees stdin/stdout to a log file:

```bash
# log-lsp.sh
#!/bin/bash
dot-lsp --stdio 2>&1 | tee /tmp/dot-lsp.log
```

Alternatively, many editors have a built-in LSP trace mode. In VS Code, set `"lsp.trace.server": "verbose"` (exact key depends on the LSP client extension). In Neovim with nvim-lspconfig, set `vim.lsp.set_log_level("debug")` and check `~/.local/state/nvim/lsp.log`.

---

## Troubleshooting

### Server Not Starting

**Symptom:** The editor reports that it could not start the LSP server, or no completions appear at all.

**Checks:**

1. Verify the binary is on your `PATH`:
   ```bash
   which dot-lsp
   dot-lsp --stdio
   ```
2. If using a local install, confirm the path in your editor config points to `./node_modules/.bin/dot-lsp` and that `node_modules` exists (run `npm install` if not).
3. Check the Node.js version (see [Node.js version requirements](#nodejs-version-requirements) below).
4. Look at the editor's LSP output panel or log file for the exact error message from the process.

### Completions Not Appearing

**Symptom:** The server starts, but no suggestions appear when typing inside `dot(...)` or `dot="..."`.

**Checks:**

1. Confirm the cursor is inside a recognized syntax pattern (see [Recognized Syntax Patterns](#recognized-syntax-patterns)). Completions are not offered outside these regions.
2. Trigger completion manually using your editor's completion keybind (e.g. `Ctrl+Space` in VS Code) rather than relying solely on auto-trigger.
3. Verify the file type is one of the four configured types: `typescript`, `typescriptreact`, `javascript`, `javascriptreact`.
4. The completion list is capped at 500 items per request. If you have already typed several characters and the list appears empty, try triggering again with fewer characters typed — the filter may be excluding all results at a high specificity.

### False Positive Diagnostics

**Symptom:** Warnings appear for tokens that are valid dot utilities.

**Checks:**

1. Confirm the installed package graph includes the direct `@hua-labs/dot` runtime dependency. A partial or manually copied Dot LSP installation can leave hover fallback and diagnostic resolution unavailable for tokens outside the package-local catalog.
2. If you are using a custom token defined only in a project-level dot config, the package-local catalog will not contain it. The server falls back to the Dot engine for resolution — verify that your project's Dot config is on the module resolution path used by the server process (i.e., the server is started from the project root).
3. Confirm the token is not a typo. Hover over it to see whether hover documentation appears — if it does, the token is known and should not produce a diagnostic.

### Node.js Version Requirements

The supported minimum is **Node.js 20.16.0**. Versions below that floor are unsupported. Package managers may warn or refuse installation when engine enforcement is enabled. Runtime behavior below the supported floor is not guaranteed.

Check your version:

```bash
node --version
```

If you have multiple Node.js versions installed (e.g. via `nvm` or `fnm`), ensure the version active in the shell environment used by your editor is 20.16.0 or later. Editor processes do not always inherit the same shell environment as your terminal.
