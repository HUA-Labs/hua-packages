#!/bin/bash
set -e

# Log file for debugging
LOG_FILE="${LOG_FILE:-/tmp/hua-motion-core-build.log}"
echo "=== Build script started at $(date) ===" >> "$LOG_FILE"
echo "PATH: $PATH" >> "$LOG_FILE"
echo "PWD: $(pwd)" >> "$LOG_FILE"
echo "USER: $(whoami)" >> "$LOG_FILE"

# Try to find node executable
NODE_PATH=""

# Try common paths
echo "[@hua-labs/motion-core] Trying common node paths..." | tee -a "$LOG_FILE"
for path in "/usr/bin/node" "/usr/local/bin/node" "/opt/homebrew/bin/node" "/vercel/.nodejs/bin/node"; do
  echo "[@hua-labs/motion-core] Checking: $path" | tee -a "$LOG_FILE"
  if [ -f "$path" ]; then
    NODE_PATH="$path"
    echo "[@hua-labs/motion-core] Found node at: $NODE_PATH" | tee -a "$LOG_FILE"
    break
  fi
done

# Try which command
if [ -z "$NODE_PATH" ]; then
  echo "[@hua-labs/motion-core] Trying which node..." | tee -a "$LOG_FILE"
  WHICH_NODE=$(which node 2>&1 || true)
  echo "[@hua-labs/motion-core] which node output: $WHICH_NODE" | tee -a "$LOG_FILE"
  if [ -n "$WHICH_NODE" ] && [ -f "$WHICH_NODE" ]; then
    NODE_PATH="$WHICH_NODE"
    echo "[@hua-labs/motion-core] Found node via which: $NODE_PATH" | tee -a "$LOG_FILE"
  fi
fi

# Try command -v
if [ -z "$NODE_PATH" ]; then
  echo "[@hua-labs/motion-core] Trying command -v node..." | tee -a "$LOG_FILE"
  COMMAND_V_NODE=$(command -v node 2>&1 || true)
  echo "[@hua-labs/motion-core] command -v node output: $COMMAND_V_NODE" | tee -a "$LOG_FILE"
  if [ -n "$COMMAND_V_NODE" ] && [ -f "$COMMAND_V_NODE" ]; then
    NODE_PATH="$COMMAND_V_NODE"
    echo "[@hua-labs/motion-core] Found node via command -v: $NODE_PATH" | tee -a "$LOG_FILE"
  fi
fi

# Fallback to node in PATH
if [ -z "$NODE_PATH" ]; then
  echo "[@hua-labs/motion-core] Using 'node' from PATH as fallback" | tee -a "$LOG_FILE"
  NODE_PATH="node"
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "[@hua-labs/motion-core] Script directory: $SCRIPT_DIR" | tee -a "$LOG_FILE"
echo "[@hua-labs/motion-core] Package directory: $PACKAGE_DIR" | tee -a "$LOG_FILE"

# Find tsc.js
TSC_PATH=""
echo "[@hua-labs/motion-core] Looking for TypeScript compiler..." | tee -a "$LOG_FILE"

# Try multiple paths
TSC_PATHS=(
  "$PACKAGE_DIR/node_modules/typescript/lib/tsc.js"
  "$PACKAGE_DIR/../../node_modules/typescript/lib/tsc.js"
  "$PACKAGE_DIR/../../../node_modules/typescript/lib/tsc.js"
  "$(dirname "$SCRIPT_DIR")/../../node_modules/typescript/lib/tsc.js"
)

for tsc_path in "${TSC_PATHS[@]}"; do
  echo "[@hua-labs/motion-core] Checking: $tsc_path" | tee -a "$LOG_FILE"
  if [ -f "$tsc_path" ]; then
    TSC_PATH="$tsc_path"
    echo "[@hua-labs/motion-core] Found TypeScript at: $TSC_PATH" | tee -a "$LOG_FILE"
    break
  fi
done

if [ -z "$TSC_PATH" ]; then
  echo "[@hua-labs/motion-core] ERROR: TypeScript compiler not found" | tee -a "$LOG_FILE"
  echo "[@hua-labs/motion-core] Searched paths:" | tee -a "$LOG_FILE"
  for tsc_path in "${TSC_PATHS[@]}"; do
    echo "[@hua-labs/motion-core]   - $tsc_path" | tee -a "$LOG_FILE"
  done
  exit 1
fi

# Verify node executable
if [ ! -f "$NODE_PATH" ] && [ "$NODE_PATH" != "node" ]; then
  echo "[@hua-labs/motion-core] ERROR: Node.js not found at: $NODE_PATH" | tee -a "$LOG_FILE"
  exit 1
fi

# Execute tsc
echo "[@hua-labs/motion-core] Using Node.js at: $NODE_PATH" | tee -a "$LOG_FILE"
echo "[@hua-labs/motion-core] Using TypeScript at: $TSC_PATH" | tee -a "$LOG_FILE"
echo "[@hua-labs/motion-core] Building in: $PACKAGE_DIR" | tee -a "$LOG_FILE"

cd "$PACKAGE_DIR"
echo "[@hua-labs/motion-core] Changed to package directory: $(pwd)" | tee -a "$LOG_FILE"

# Try to execute
echo "[@hua-labs/motion-core] Executing: $NODE_PATH $TSC_PATH" | tee -a "$LOG_FILE"
if [ "$NODE_PATH" = "node" ]; then
  exec node "$TSC_PATH" 2>&1 | tee -a "$LOG_FILE"
else
  exec "$NODE_PATH" "$TSC_PATH" 2>&1 | tee -a "$LOG_FILE"
fi

