#!/bin/bash
set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Add node_modules/.bin to PATH
export PATH="$PACKAGE_DIR/node_modules/.bin:$PACKAGE_DIR/../../node_modules/.bin:$PATH"

# Try to find tsc
TSC_PATH=""
if [ -f "$PACKAGE_DIR/node_modules/.bin/tsc" ]; then
  TSC_PATH="$PACKAGE_DIR/node_modules/.bin/tsc"
elif [ -f "$PACKAGE_DIR/../../node_modules/.bin/tsc" ]; then
  TSC_PATH="$PACKAGE_DIR/../../node_modules/.bin/tsc"
else
  echo "[@hua-labs/ui] TypeScript compiler not found"
  exit 1
fi

# Execute tsc
cd "$PACKAGE_DIR"
exec "$TSC_PATH"

