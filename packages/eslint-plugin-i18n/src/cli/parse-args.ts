/**
 * Lightweight argument parser — no external dependencies.
 */
export interface ParsedArgs {
  command: string;
  flags: Record<string, string>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  // argv: process.argv.slice(2)
  const command = argv[0] || 'help';
  const flags: Record<string, string> = {};

  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const eqIndex = key.indexOf('=');
      if (eqIndex !== -1) {
        flags[key.slice(0, eqIndex)] = key.slice(eqIndex + 1);
      } else {
        // Next arg is the value (or true if no next arg / next is another flag)
        const next = argv[i + 1];
        if (next && !next.startsWith('--')) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = 'true';
        }
      }
    }
  }

  return { command, flags };
}
