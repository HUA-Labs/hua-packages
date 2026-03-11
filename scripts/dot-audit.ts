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

const unknown: string[] = [];
for (const token of allTokens) {
  if (!token) continue;
  if (/^(dark|hover|focus|active|sm|md|lg|xl|2xl|group-hover|disabled|placeholder):/.test(token)) continue;
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
