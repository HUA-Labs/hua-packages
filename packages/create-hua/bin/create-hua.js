#!/usr/bin/env node

/**
 * create-hua
 *
 * This is an alias for create-hua-ux.
 * Usage: npx create-hua [project-name]
 *
 * For more options, see: https://github.com/HUA-Labs/hua
 */

const { spawn } = require('child_process');
const path = require('path');

// Pass all arguments to create-hua-ux
const args = process.argv.slice(2);

console.log('\n🚀 create-hua - HUA-UX Project Generator\n');

// Try to run create-hua-ux directly via npx
const child = spawn('npx', ['create-hua-ux@latest', ...args], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (err) => {
  console.error('Failed to start create-hua-ux:', err.message);
  console.log('\nTry running directly: npx create-hua-ux@latest');
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code || 0);
});
