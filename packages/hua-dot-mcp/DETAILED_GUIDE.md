# @hua-labs/dot-mcp Detailed Guide

MCP server for the [@hua-labs/dot](https://www.npmjs.com/package/@hua-labs/dot) style engine.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Installation & Setup](#installation--setup)
3. [Core Concepts](#core-concepts)
4. [Tool Reference](#tool-reference)
   - [dot_resolve](#dot_resolve)
   - [dot_explain](#dot_explain)
   - [dot_complete](#dot_complete)
   - [dot_validate](#dot_validate)
5. [Client Configuration](#client-configuration)
6. [Advanced Usage](#advanced-usage)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### MCP Protocol

`@hua-labs/dot-mcp` implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io), which defines a standard way for AI assistants to invoke external tools. The server acts as an MCP provider — it advertises a set of tools, receives structured JSON calls from the client, and returns structured JSON responses.

### stdio Transport

The server communicates exclusively over **stdio transport**. It reads newline-delimited JSON from `stdin` and writes responses to `stdout`. This means:

- No HTTP port is opened.
- The host process (Claude Desktop, VS Code, etc.) spawns the server as a child process.
- Lifecycle is tied to the host: the server exits when the host closes the pipe.

### 4 Tools Overview

| Tool           | Purpose                                                                     |
| -------------- | --------------------------------------------------------------------------- |
| `dot_resolve`  | Resolve utility strings into style objects for a target platform            |
| `dot_explain`  | Capability report showing what works, what is dropped, what is approximated |
| `dot_complete` | Completion suggestions for partial utility tokens                           |
| `dot_validate` | Validate tokens — check that each resolves to at least one CSS property     |

### Request / Response Flow

```
AI Assistant
    │
    │  MCP tool call (JSON)
    ▼
dot-mcp process (stdio)
    │
    │  calls @hua-labs/dot engine
    ▼
dot engine
    │
    │  style object / report / suggestions
    ▼
dot-mcp process
    │
    │  MCP response: { content: [{ type: "text", text: "<JSON string>" }] }
    ▼
AI Assistant
```

The `content[0].text` field of every response is a JSON string. Clients must parse it to access the result data.

---

## Installation & Setup

### Global Install

```bash
npm install -g @hua-labs/dot-mcp
```

After installation, the binary `dot-mcp` is available on your PATH.

### npx (No Install)

```bash
npx @hua-labs/dot-mcp
```

Use this in MCP client config when you prefer not to install globally or want to always use the latest version.

### Binary Name

The installed binary is `dot-mcp` (set by the `bin` field in `package.json`). When referencing the command in MCP client configuration, use `dot-mcp` for a global install or use `npx` with `args: ["@hua-labs/dot-mcp"]` for the npx variant.

**Requirements:** Node.js >= 20.0.0

---

## Core Concepts

### MCP Tool Model

Each tool is a named operation with a JSON Schema-defined parameter set. The MCP client (AI assistant) selects a tool, passes arguments, and receives a response. Tools are stateless — each call is independent with no session state preserved between calls.

### How the dot Engine is Exposed

`@hua-labs/dot-mcp` is a thin protocol adapter over `@hua-labs/dot`. It:

1. Receives a tool call with parameters (e.g., `input`, `target`, `dark`, `breakpoint`).
2. Calls the appropriate dot engine function (`dot()`, `dotExplain()`, completion index, validation logic).
3. Serializes the result to a JSON string and returns it inside the MCP `content` array.

No configuration of the dot engine is required. The engine's built-in token registry and platform adapters are used directly.

### Target Platforms

| Target    | Description                           | Style Object Shape                                |
| --------- | ------------------------------------- | ------------------------------------------------- |
| `web`     | Default. CSS for browser environments | `CSSProperties`-compatible (string/number values) |
| `native`  | React Native StyleSheet               | Numeric sizes, camelCase property names           |
| `flutter` | Flutter widget recipe                 | `FlutterRecipe` object                            |

Platform support varies by property. Use `dot_explain` to surface which properties are dropped or approximated on a given target.

---

## Tool Reference

### dot_resolve

Resolve a dot utility string into a style object for web, native (React Native), or Flutter targets.

**Parameters:**

| Name         | Type                                    | Required | Description                                                                    |
| ------------ | --------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `input`      | `string`                                | Yes      | Space-separated dot utility string, e.g. `"p-4 flex items-center bg-blue-500"` |
| `target`     | `"web" \| "native" \| "flutter"`        | No       | Target platform (default: `"web"`)                                             |
| `dark`       | `boolean`                               | No       | Apply dark mode styles                                                         |
| `breakpoint` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl"` | No       | Active breakpoint for responsive styles                                        |

**Response Shape:**

`content[0].text` contains a JSON-stringified style object. Shape varies by target:

- `web` — `CSSProperties`-compatible object with string/number values
- `native` — React Native `StyleSheet`-compatible object (numeric sizes, camelCase)
- `flutter` — Flutter recipe object (`FlutterRecipe`)

**Example — web target:**

Input:

```json
{
  "input": "p-4 flex items-center bg-blue-500",
  "target": "web"
}
```

`content[0].text` parsed:

```json
{
  "padding": "16px",
  "display": "flex",
  "alignItems": "center",
  "backgroundColor": "#3b82f6"
}
```

**Error Response:**

When the tool call fails (e.g., invalid parameter types), the response has `isError: true`:

```json
{
  "content": [{ "type": "text", "text": "Error: <message>" }],
  "isError": true
}
```

---

### dot_explain

Resolve a dot utility string and get a capability report showing what works, what is dropped, and what is approximated on the target platform. Most useful when `target` is `"native"` or `"flutter"`.

**Parameters:**

| Name         | Type                                    | Required | Description                                                               |
| ------------ | --------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `input`      | `string`                                | Yes      | Space-separated dot utility string, e.g. `"p-4 blur-md grid grid-cols-3"` |
| `target`     | `"web" \| "native" \| "flutter"`        | No       | Target platform (default: `"web"`)                                        |
| `dark`       | `boolean`                               | No       | Apply dark mode styles                                                    |
| `breakpoint` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl"` | No       | Active breakpoint for responsive styles                                   |

**Response Shape:**

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

**Example — native target with unsupported properties:**

Input:

```json
{
  "input": "p-4 blur-md grid grid-cols-3",
  "target": "native"
}
```

`content[0].text` parsed:

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

### dot_complete

Get completion suggestions for a partial dot utility token.

**Parameters:**

| Name      | Type     | Required | Description                                                          |
| --------- | -------- | -------- | -------------------------------------------------------------------- |
| `partial` | `string` | Yes      | Partial token to complete, e.g. `"p-"`, `"bg-"`, `"flex"`, `"text-"` |
| `limit`   | `number` | No       | Maximum suggestions to return (default: `20`)                        |

**Matching Logic:**

1. Tokens that **start with** the partial string are returned first.
2. Tokens that **contain** the partial string (but do not start with it) are appended.
3. Results are trimmed to `limit`.

When `partial` is empty, one representative token from each category is returned (up to `limit`).

**Token Categories:**

`spacing`, `colors`, `sizing`, `typography`, `layout`, `border`, `effects`, `transitions`, `transforms`, `interactivity`, `accessibility`, `gradient`

**Response Shape:**

```ts
{
  partial: string,
  count: number,
  suggestions: Array<{ token: string, category: string }>
}
```

**Example:**

Input:

```json
{ "partial": "p-4" }
```

`content[0].text` parsed:

```json
{
  "partial": "p-4",
  "count": 1,
  "suggestions": [{ "token": "p-4", "category": "spacing" }]
}
```

---

### dot_validate

Validate a dot utility string. Checks whether each token resolves to at least one CSS property.

**Parameters:**

| Name    | Type     | Required | Description                                    |
| ------- | -------- | -------- | ---------------------------------------------- |
| `input` | `string` | Yes      | Space-separated dot utility string to validate |

**Validation Logic:**

- Each token is stripped of variant prefixes (e.g. `dark:`, `hover:`) and `!` (important flag) before resolution.
- A token is flagged as unrecognized if `dot(token)` returns an empty object, except for `sr-only` and `not-sr-only` (which produce no inline CSS properties but are valid).
- The `resolved_count` reflects how many CSS properties the full input string resolves to.

**Response Shape:**

```ts
{
  valid: boolean,
  errors: string[],      // empty array when valid
  resolved_count: number // number of CSS properties in the resolved web output
}
```

**Example — valid input:**

Input:

```json
{ "input": "p-4 flex items-center" }
```

`content[0].text` parsed:

```json
{
  "valid": true,
  "errors": [],
  "resolved_count": 3
}
```

**Example — invalid token:**

Input:

```json
{ "input": "p-4 fake-utility" }
```

`content[0].text` parsed:

```json
{
  "valid": false,
  "errors": ["Unrecognized or unsupported utility: \"fake-utility\""],
  "resolved_count": 0
}
```

---

## Client Configuration

### Claude Desktop

Add to `claude_desktop_config.json` (uses the globally installed binary):

```json
{
  "mcpServers": {
    "dot-mcp": {
      "command": "dot-mcp"
    }
  }
}
```

### npx Variant

Use this when you have not installed the package globally:

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

### Other MCP Clients

Any MCP client that supports stdio transport can run `dot-mcp`. Configure the client to spawn `dot-mcp` (or `npx @hua-labs/dot-mcp`) as a child process with stdio piped. No additional arguments, environment variables, or ports are required.

---

## Advanced Usage

### Chaining Tools

The four tools are designed to be used together in workflows. Parse `content[0].text` as JSON after each call to access the result before passing it to the next tool.

### Cross-Platform Workflow: resolve → explain → validate

A common pattern when targeting non-web platforms:

**Step 1 — Validate the utility string first:**

```json
{ "tool": "dot_validate", "input": "p-4 blur-md grid grid-cols-3" }
```

Confirms all tokens are recognized before committing to a target.

**Step 2 — Resolve for the target platform:**

```json
{
  "tool": "dot_resolve",
  "input": "p-4 blur-md grid grid-cols-3",
  "target": "native"
}
```

Returns the style object that will actually be applied.

**Step 3 — Explain what was dropped:**

```json
{
  "tool": "dot_explain",
  "input": "p-4 blur-md grid grid-cols-3",
  "target": "native"
}
```

The `report._dropped` list shows which properties from Step 2 are absent on the native target, and `summary` provides a human-readable count. Use this information to substitute platform-compatible alternatives.

**Step 4 — Complete alternative tokens if needed:**

```json
{ "tool": "dot_complete", "partial": "shadow" }
```

Discover available tokens in a category to replace dropped properties.

---

## Troubleshooting

### Server Not Connecting

- Verify `dot-mcp` is on your PATH: run `dot-mcp` in a terminal. If the command is not found, either install globally (`npm install -g @hua-labs/dot-mcp`) or switch to the `npx` config variant.
- Check the MCP client logs. stdio transport errors (broken pipe, spawn failure) appear there, not in the terminal.
- Ensure Node.js >= 20.0.0 is installed: `node --version`.

### Empty Responses or `{}`

- Confirm `content[0].text` is being parsed as JSON. The response wrapper is always `{ content: [{ type: "text", text: "<JSON string>" }] }` — the actual data is the string value of `text`, not the outer object.
- For `dot_resolve` with a `native` or `flutter` target, properties that are not supported on that platform are silently dropped. Use `dot_explain` to see what was omitted.
- For `dot_complete` with an empty `partial`, the response is limited to one representative token per category (up to `limit`). Provide a non-empty prefix to get targeted suggestions.

### Error Handling

When a tool call fails, the response has `isError: true` and `content[0].text` starts with `"Error: "`:

```json
{
  "content": [{ "type": "text", "text": "Error: <message>" }],
  "isError": true
}
```

Check the error message for parameter type mismatches (e.g., passing a number where a string is expected for `input`). All required parameters are marked in the Tool Reference above.
