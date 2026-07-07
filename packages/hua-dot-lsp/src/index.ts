#!/usr/bin/env node
/**
 * dot-lsp — LSP server for the @hua-labs/dot style engine.
 *
 * Features:
 *   - Completion: utility class suggestions inside dot('...') and dot="..."
 *   - Hover:      resolved CSS properties for a utility token
 *   - Diagnostics: warn on unrecognised tokens
 *
 * Start with: dot-lsp --stdio
 */

import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  Hover,
  MarkupKind,
  Position,
  DidChangeConfigurationParams,
} from "vscode-languageserver/node.js";
import { TextDocument } from "vscode-languageserver-textdocument";
import { dot } from "@hua-labs/dot";
import { findDotRegions, type DotRegion } from "./dot-regions.js";
import { buildDotDiagnostics } from "./diagnostics.js";
import { readDotLspSettings, type DotLspSettings } from "./settings.js";
import {
  getAllCompletions,
  getCompletionsForPrefix,
  getCompletionByLabel,
  type CompletionEntry,
} from "./completions.js";

// ---------------------------------------------------------------------------
// LSP connection
// ---------------------------------------------------------------------------

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
let currentSettings: DotLspSettings = {};

connection.onInitialize((params: InitializeParams): InitializeResult => {
  currentSettings = readDotLspSettings(params.initializationOptions);

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        triggerCharacters: ['"', "'", "`", " ", ":"],
        resolveProvider: false,
      },
      hoverProvider: true,
    },
    serverInfo: {
      name: "dot-lsp",
      version: "0.1.0",
    },
  };
});

// Warm up completion cache on idle
connection.onInitialized(() => {
  // Pre-build the full completion list in the background
  setImmediate(() => getAllCompletions());
});

connection.onDidChangeConfiguration((change: DidChangeConfigurationParams) => {
  currentSettings = readDotLspSettings(change.settings);
  for (const document of documents.all()) {
    validateDocument(document);
  }
});

/**
 * Given a cursor offset, find the dot region it falls in and return:
 * - the token being typed (last space-separated word before cursor)
 * - the offset within the content
 */
function getCursorContext(
  text: string,
  offset: number,
): { region: DotRegion; lastToken: string; tokenStart: number } | null {
  const regions = findDotRegions(text);
  for (const region of regions) {
    if (offset >= region.contentStart && offset <= region.contentEnd) {
      const relative = offset - region.contentStart;
      const before = region.content.slice(0, relative);
      const lastSpace = before.lastIndexOf(" ");
      const lastToken = before.slice(lastSpace + 1);
      return {
        region,
        lastToken,
        tokenStart: region.contentStart + lastSpace + 1,
      };
    }
  }
  return null;
}

/**
 * Find the token at exact cursor position (for hover).
 * Returns the utility token string under the cursor.
 */
function getTokenAtOffset(text: string, offset: number): string | null {
  const regions = findDotRegions(text);
  for (const region of regions) {
    if (offset < region.contentStart || offset > region.contentEnd) continue;
    const relative = offset - region.contentStart;
    const content = region.content;
    // Walk left to find space or start
    let left = relative;
    while (left > 0 && content[left - 1] !== " ") left--;
    // Walk right to find space or end
    let right = relative;
    while (right < content.length && content[right] !== " ") right++;
    if (left === right) return null;
    return content.slice(left, right);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Completion
// ---------------------------------------------------------------------------

connection.onCompletion(
  (params: TextDocumentPositionParams): CompletionItem[] => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return [];

    const text = doc.getText();
    const offset = doc.offsetAt(params.position);
    const ctx = getCursorContext(text, offset);
    if (!ctx) return [];

    const completions = getCompletionsForPrefix(ctx.lastToken);

    return completions.slice(0, 500).map((entry) => ({
      label: entry.label,
      kind: CompletionItemKind.Value,
      detail: entry.detail,
      documentation: entry.documentation
        ? { kind: MarkupKind.PlainText, value: entry.documentation }
        : undefined,
      // Insert only the suffix after what's already typed
      insertText: entry.label.slice(ctx.lastToken.length),
      // filterText so the client can rank properly
      filterText: entry.label,
      sortText: entry.label,
    }));
  },
);

// ---------------------------------------------------------------------------
// Hover
// ---------------------------------------------------------------------------

connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;

  const text = doc.getText();
  const offset = doc.offsetAt(params.position);
  const token = getTokenAtOffset(text, offset);
  if (!token) return null;

  // First check our completion entries for the detail string
  const entry = getCompletionByLabel(token);
  if (entry) {
    const lines: string[] = [`**${token}**`, "", `\`${entry.detail}\``];
    if (entry.documentation) lines.push("", entry.documentation);
    return { contents: { kind: MarkupKind.Markdown, value: lines.join("\n") } };
  }

  // Fall back to resolving via dot() itself
  try {
    const resolved = dot(token);
    if (Object.keys(resolved).length === 0) return null;
    const cssLines = Object.entries(resolved)
      .map(([k, v]) => `  ${camelToKebab(k)}: ${v};`)
      .join("\n");
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: `**${token}**\n\n\`\`\`css\n.token {\n${cssLines}\n}\n\`\`\``,
      },
    };
  } catch {
    return null;
  }
});

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

documents.onDidChangeContent((change) => {
  validateDocument(change.document);
});

documents.onDidOpen((event) => {
  validateDocument(event.document);
});

async function validateDocument(doc: TextDocument): Promise<void> {
  const text = doc.getText();
  const allCompletions = getAllCompletions();
  const diagnostics = buildDotDiagnostics(
    text,
    doc.positionAt.bind(doc),
    allCompletions,
    currentSettings,
  );
  connection.sendDiagnostics({ uri: doc.uri, diagnostics });
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

documents.listen(connection);
connection.listen();
