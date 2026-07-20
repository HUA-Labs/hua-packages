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

**Completion provider** — Scans the cursor position to determine whether it is inside a `dot(...)` call or `dot="..."` attribute. If so, it returns matching utility tokens from the built-in list. The response is capped at 500 items per request. `insertText` is set to only the suffix of the token that has not yet been typed, enabling incremental completion without duplicating already-typed characters. Every base token is also expanded with each supported variant prefix, so the list covers `hover:p-4`, `dark:bg-white`, etc.

**Hover provider** — Resolves the token under the cursor and returns a Markdown popup showing the token name and its CSS output. If the token is not in the built-in list, resolution falls back to the dot engine directly. No popup is shown when the engine produces no output.

**Diagnostics provider** — Runs on every `textDocument/didOpen` and
`textDocument/didChange` event. It scans all dot regions in the file. A
CSS-only responsive, state, dark-mode, or pseudo variant emits a `Warning`
because inline `dot()` cannot apply it; the message directs the caller to
`dotClass()` or `classDot`. Other prefixes and the `!` important prefix are
stripped before the unknown-token check. Unknown tokens also emit a `Warning`.

### Token Coverage Boundary

The completion and diagnostics providers share a package-local token list that
is hand-maintained in `src/completions.ts` and inlined into the server bundle.
It is organized through 15 builder groups and expanded with the supported
variant prefixes, but it is not generated from or guaranteed to exhaust the
current Dot registry. Tokens outside that list can still be resolved by the
installed `@hua-labs/dot` fallback for hover and diagnostics.

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

or via the package name with `npx`:

```bash
npx @hua-labs/dot-lsp --stdio
```

### Binary Name

The executable is named **`dot-lsp`** regardless of install method. All editor configuration examples below use this name and assume it is on `PATH`. Substitute the full path if using a local install.

### Engine Dependency

`@hua-labs/dot` is installed as a package dependency of `@hua-labs/dot-lsp`.
When `@hua-labs/dot-lsp` is installed from npm, the matching dot engine package
is installed with it so hover fallback and diagnostic resolution can run without
an extra peer install step.

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

### Token Coverage Categories

The built-in token list covers the following categories:

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

Every base token in the built-in list is also offered as a completion item prefixed with each of the supported variants:

```
hover:   focus:   active:   focus-visible:   focus-within:
disabled:   dark:   sm:   md:   lg:   xl:   2xl:
```

Completion availability does not imply inline runtime support. During
diagnostics, a CSS-only variant such as `hover:p-4` produces a `Warning` that
variants require `dotClass()` or a `classDot` prop. Only prefixes outside the
known CSS-only set are stripped before the base unknown-token check.

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

There is no first-party VS Code extension in this package release. Use a
generic VS Code LSP client and translate the following values into that
client's own settings schema:

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

Exact JSON keys differ by client. The package-owned values are:

- **command:** `["dot-lsp", "--stdio"]`
- **file types:** selected by the client; the server itself does not register or
  enforce a file-type list
- **initializationOptions.dot.target:** optional `"web"`, `"native"`, or
  `"flutter"` for target caveat diagnostics

Treat any separately distributed editor extension as an independent
availability, version, and support decision. Its existence must not be inferred
from installation of `@hua-labs/dot-lsp`.

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

This is an illustrative client configuration. Neovim/lspconfig APIs and
file-type registration are client-owned and may differ by installed version;
preserve the `dot-lsp --stdio` command and optional initialization target when
adapting it.

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
2. Server replies with `InitializeResult` advertising completion, hover, and diagnostics support.
3. Client sends `initialized` notification.
4. Client sends `textDocument/didOpen` to begin receiving diagnostics.

The server advertises the following trigger characters for completion: `"` `'` `` ` `` ` ` (space) `:`

The package registers standard LSP handlers only. Client configuration,
process supervision, and document/file-type association still vary by editor
and are not proven by the server source alone.

### Debugging LSP Communication

Use the editor client's built-in LSP trace facility. Do not merge stderr into
stdout or insert a generic `tee` pipeline in front of the server: stdout is the
LSP protocol transport, and unrelated bytes can corrupt the session. Exact
trace settings and log locations are client/version specific.

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
3. Verify that your client associates the document's file type with this
   server. The server does not choose that list itself.
4. The completion list is capped at 500 items per request. If you have already typed several characters and the list appears empty, try triggering again with fewer characters typed — the filter may be excluding all results at a high specificity.

### False Positive Diagnostics

**Symptom:** Warnings appear for tokens that are valid dot utilities.

**Checks:**

1. Ensure the installed `@hua-labs/dot-lsp` package includes its `@hua-labs/dot` dependency. If the dependency install is incomplete or the package tree is corrupted, the engine fallback used during diagnostics cannot resolve tokens and every token outside the built-in list will appear as unknown.
2. A custom token defined only in application configuration is not loaded by
   this server. Its runtime settings accept only an optional `target`; starting
   the process at a project root does not make it import a project Dot config.
   Keep application-only tokens out of this diagnostic contract.
3. Confirm the token is not a typo. Hover over it to see whether hover documentation appears — if it does, the token is known and should not produce a diagnostic.

### Node.js Version Requirements

The server requires **Node.js 20 or later**. Running it on an older version will cause the process to exit immediately, which editors typically report as a server crash.

Check your version:

```bash
node --version
```

If you have multiple Node.js versions installed (e.g. via `nvm` or `fnm`), ensure the version active in the shell environment used by your editor is 20+. Editor processes do not always inherit the same shell environment as your terminal.
