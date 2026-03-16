# @hua-labs/dot-mcp

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot-mcp.svg)](https://www.npmjs.com/package/@hua-labs/dot-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot-mcp.svg)](https://www.npmjs.com/package/@hua-labs/dot-mcp)
[![license](https://img.shields.io/npm/l/@hua-labs/dot-mcp.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

MCP (Model Context Protocol) server for the [dot style engine](https://github.com/HUA-Labs/hua-packages). Exposes four tools that let AI assistants resolve, explain, complete, and validate dot utility strings across web, React Native, and Flutter targets.

## Installation

```bash
npm install -g @hua-labs/dot-mcp
```

Or run without installation via npx:

```bash
npx @hua-labs/dot-mcp
```

## MCP Client Configuration

The server communicates over **stdio transport**. Add it to your MCP client configuration:

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "dot-mcp": {
      "command": "dot-mcp"
    }
  }
}
```

### With npx

```json
{
  "mcpServers": {
    "dot-mcp": {
      "command": "npx",
      "args": ["@hua-labs/dot-mcp"]
    }
  }
}
```

### Binary name

The installed binary is `dot-mcp` (from the `bin` field in `package.json`).

## Tools

### `dot_resolve`

Resolve a dot utility string into a style object for web, native (React Native), or Flutter targets.

**Parameters:**

| Name         | Type                                    | Required | Description                                                                    |
| ------------ | --------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `input`      | `string`                                | Yes      | Space-separated dot utility string, e.g. `"p-4 flex items-center bg-blue-500"` |
| `target`     | `"web" \| "native" \| "flutter"`        | No       | Target platform (default: `"web"`)                                             |
| `dark`       | `boolean`                               | No       | Apply dark mode styles                                                         |
| `breakpoint` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl"` | No       | Active breakpoint for responsive styles                                        |

**Response shape:**

The `content[0].text` field contains a JSON-stringified style object. Shape varies by target:

- `web` — `CSSProperties`-compatible object with string/number values
- `native` — React Native `StyleSheet`-compatible object (numeric sizes, camelCase)
- `flutter` — Flutter recipe object (`FlutterRecipe`)

**Example response (web):**

```json
{
  "padding": "16px",
  "display": "flex",
  "alignItems": "center",
  "backgroundColor": "#3b82f6"
}
```

**Error response:**

```json
{
  "content": [{ "type": "text", "text": "Error: <message>" }],
  "isError": true
}
```

---

### `dot_explain`

Resolve a dot utility string and get a capability report showing what works, what is dropped, and what is approximated on the target platform. Most useful when `target` is `"native"` or `"flutter"`.

**Parameters:**

| Name         | Type                                    | Required | Description                                                               |
| ------------ | --------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `input`      | `string`                                | Yes      | Space-separated dot utility string, e.g. `"p-4 blur-md grid grid-cols-3"` |
| `target`     | `"web" \| "native" \| "flutter"`        | No       | Target platform (default: `"web"`)                                        |
| `dark`       | `boolean`                               | No       | Apply dark mode styles                                                    |
| `breakpoint` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl"` | No       | Active breakpoint for responsive styles                                   |

**Response shape:**

`content[0].text` is a JSON string with this shape:

```ts
{
  styles: StyleObject,           // resolved styles (same as dot_resolve)
  report: {
    _dropped?: string[],         // CSS properties not supported on the target
    _approximated?: string[],    // properties with limited/approximate support
    _capabilities?: Record<string, "unsupported" | "approximate" | "web-only">,
    _details?: Record<string, string[]>  // extra notes, e.g. shadow approximation reasons
  },
  summary: string                // human-readable summary
}
```

When `target` is `"web"` or no unsupported properties exist, `report` is `{}` and `summary` is `"All properties supported on this target"`.

**Example response (native target with unsupported props):**

```json
{
  "styles": { "padding": 16 },
  "report": {
    "_dropped": ["filter", "gridTemplateColumns"],
    "_capabilities": {
      "filter": "unsupported",
      "gridTemplateColumns": "unsupported"
    }
  },
  "summary": "2 properties dropped, 0 approximated"
}
```

---

### `dot_complete`

Get completion suggestions for a partial dot utility token.

**Parameters:**

| Name      | Type     | Required | Description                                                          |
| --------- | -------- | -------- | -------------------------------------------------------------------- |
| `partial` | `string` | Yes      | Partial token to complete, e.g. `"p-"`, `"bg-"`, `"flex"`, `"text-"` |
| `limit`   | `number` | No       | Maximum suggestions to return (default: `20`)                        |

**Matching logic:**

1. Tokens that **start with** the partial string are returned first.
2. Tokens that **contain** the partial string (but do not start with it) are appended.
3. Results are trimmed to `limit`.

When `partial` is empty, one representative token from each category is returned (up to `limit`).

**Token categories:** `spacing`, `colors`, `sizing`, `typography`, `layout`, `border`, `effects`, `transitions`, `transforms`, `interactivity`, `accessibility`, `gradient`

**Response shape:**

```ts
{
  partial: string,
  count: number,
  suggestions: Array<{ token: string, category: string }>
}
```

**Example:**

Input `partial: "p-4"` returns:

```json
{
  "partial": "p-4",
  "count": 1,
  "suggestions": [{ "token": "p-4", "category": "spacing" }]
}
```

---

### `dot_validate`

Validate a dot utility string. Checks whether each token resolves to at least one CSS property.

**Parameters:**

| Name    | Type     | Required | Description                                    |
| ------- | -------- | -------- | ---------------------------------------------- |
| `input` | `string` | Yes      | Space-separated dot utility string to validate |

**Validation logic:**

- Each token is stripped of variant prefixes (e.g. `dark:`, `hover:`) and `!` (important flag) before resolution.
- A token is flagged as unrecognized if `dot(token)` returns an empty object, except for `sr-only` and `not-sr-only` (which produce no inline CSS properties but are valid).
- The `resolved_count` reflects how many CSS properties the full input string resolves to.

**Response shape:**

```ts
{
  valid: boolean,
  errors: string[],      // empty array when valid
  resolved_count: number // number of CSS properties in the resolved web output
}
```

**Example (valid input):**

```json
{
  "valid": true,
  "errors": [],
  "resolved_count": 3
}
```

**Example (invalid token):**

```json
{
  "valid": false,
  "errors": ["Unrecognized or unsupported utility: \"fake-utility\""],
  "resolved_count": 0
}
```

## Related Packages

- [`@hua-labs/dot`](https://www.npmjs.com/package/@hua-labs/dot) — Core style engine
- [`@hua-labs/dot-lsp`](https://www.npmjs.com/package/@hua-labs/dot-lsp) — LSP server for editor integration
- [`@hua-labs/dot-aot`](https://www.npmjs.com/package/@hua-labs/dot-aot) — Build-time static extraction
- [`@hua-labs/dot-vscode`](https://marketplace.visualstudio.com/items?itemName=hua-labs.dot-vscode) — VS Code extension

## Requirements

- Node.js >= 20.0.0

## License

MIT — [HUA Labs](https://hua-labs.com)
