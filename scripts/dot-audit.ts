import { dot } from '../packages/hua-dot/src/index.ts';
import * as fs from 'fs';
import * as path from 'path';

const patterns: string[] = [];
function scan(dir: string) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', 'dist', '_reference', '__tests__'].includes(f.name)) continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) scan(p);
    else if (/\.(tsx?|jsx?)$/.test(f.name)) {
      const content = fs.readFileSync(p, 'utf8');
      for (const m of content.matchAll(/dot=['"]([^'"]+)['"]/g)) patterns.push(m[1]);
      for (const m of content.matchAll(/dot\(['"]([^'"]+)['"]/g)) patterns.push(m[1]);
      for (const m of content.matchAll(/useDot\(['"]([^'"]+)['"]/g)) patterns.push(m[1]);
    }
  }
}
scan('./apps/my-app/app');
scan('./packages/hua-ui/src');

const allTokens = new Set<string>();
patterns.forEach(p => p.split(/\s+/).forEach(t => allTokens.add(t)));

// Tokens intentionally excluded from the unknown-token report:
//   1. Variant-prefixed tokens — handled by class adapter (dark:, hover:, etc.)
//   2. Gradient direction tokens — supported by gradient resolver (bg-gradient-to-*)
//   3. Class-mode-only marker tokens — pass through as literal class names (group, peer)
//   4. Structural pseudo-class variants — class adapter handles (first:, last:, odd:, even:)
//   5. divide-x/y — intentionally unsupported by dot style engine
//   6. Animation/prose tokens — outside dot scope
const EXCLUDED_PATTERNS: RegExp[] = [
  // Variant-prefixed tokens
  /^(dark|hover|focus|active|sm|md|lg|xl|2xl|group-hover|group-focus|group-active|peer-checked|peer-focus|peer-hover|peer-disabled|disabled|placeholder|focus-visible|focus-within|first|last|odd|even|before|after):./,
  // Gradient direction tokens (supported by gradient resolver)
  /^bg-gradient-to(-[a-z]+)*$/,
  // Class-mode-only marker tokens
  /^(group|peer)$/,
  // Structural pseudo-class standalone variants used as class-mode selectors
  /^(first|last|odd|even):/,
  // divide-x/y (intentionally unsupported)
  /^divide-[xy]$/,
  // animate-* (animation tokens — scoped to keyframe context)
  /^animate-/,
  // prose (typography plugin — outside dot scope)
  /^prose/,
];

const unknown: string[] = [];
for (const token of allTokens) {
  if (!token) continue;
  if (EXCLUDED_PATTERNS.some((re) => re.test(token))) continue;
  const result = dot(token);
  if (Object.keys(result).length === 0) unknown.push(token);
}
unknown.sort();

const output = `# dot Unknown Token Audit
Generated: ${new Date().toISOString()}
Total unique tokens: ${allTokens.size}
Unknown tokens: ${unknown.length}

${unknown.map(t => `- \`${t}\``).join('\n')}
`;
fs.writeFileSync('./docs/areas/tasks/dot-unknown-tokens-audit.md', output);
console.log(`Done: ${unknown.length} unknown out of ${allTokens.size} total`);
