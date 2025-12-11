#!/bin/bash
set -e

# Find node executable
NODE_PATH=""

# Try common paths
for path in "/usr/bin/node" "/usr/local/bin/node" "/opt/homebrew/bin/node" "/vercel/.nodejs/bin/node" "$(which node 2>/dev/null || true)"; do
  if [ -n "$path" ] && [ -f "$path" ]; then
    NODE_PATH="$path"
    break
  fi
done

# Fallback to node in PATH
if [ -z "$NODE_PATH" ]; then
  NODE_PATH="node"
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to package directory
cd "$PACKAGE_DIR"

# Execute build command
"$NODE_PATH" ../../node_modules/tsx/dist/cli.mjs ../../node_modules/tsup/dist/cli-default.js
"$NODE_PATH" ../../node_modules/typescript/lib/tsc.js --emitDeclarationOnly

