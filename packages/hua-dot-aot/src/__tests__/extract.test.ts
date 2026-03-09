import { describe, it, expect } from 'vitest';
import { extractStaticCalls, transformSource, styleToObjectLiteral } from '../extract';

describe('extractStaticCalls', () => {
  it('extracts simple dot() call', () => {
    const source = `const style = dot('p-4 bg-red-500');`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(1);
    expect(calls[0].input).toBe('p-4 bg-red-500');
    expect(calls[0].result).toHaveProperty('padding', '16px');
    expect(calls[0].result).toHaveProperty('backgroundColor');
  });

  it('extracts multiple dot() calls', () => {
    const source = `
      const a = dot('p-4');
      const b = dot('m-2');
    `;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(2);
  });

  it('extracts dot() with double quotes', () => {
    const source = `const style = dot("text-lg font-bold");`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(1);
    expect(calls[0].input).toBe('text-lg font-bold');
  });

  it('skips dot() with non-string argument', () => {
    const source = `const style = dot(myVariable);`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it('skips template literal argument', () => {
    const source = 'const style = dot(`p-${size}`);';
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it('extracts with static options { target }', () => {
    const source = `const style = dot('p-4', { target: 'native' });`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(1);
    expect(calls[0].options?.target).toBe('native');
    // Native adapter converts px to numbers
    expect(calls[0].result.padding).toBe(16);
  });

  it('respects custom function names', () => {
    const source = `const style = css('p-4');`;
    const calls = extractStaticCalls(source, { functionNames: ['css'] });
    expect(calls).toHaveLength(1);
  });

  it('does not match property access dot()', () => {
    const source = `obj.dot('p-4');`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it('returns results sorted last-first', () => {
    const source = `const a = dot('p-4'); const b = dot('m-2');`;
    const calls = extractStaticCalls(source);
    expect(calls[0].start).toBeGreaterThan(calls[1].start);
  });
});

// ---------------------------------------------------------------------------
// Fix 1: string/comment false positives
// ---------------------------------------------------------------------------
describe('string/comment context detection', () => {
  it('skips dot() inside double-quoted string', () => {
    const source = `const msg = "call dot('p-4') later";`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it('skips dot() inside single-line comment', () => {
    const source = `// dot('p-4')\nconst x = 1;`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it('skips dot() inside block comment', () => {
    const source = `/* dot('p-4') */\nconst x = 1;`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it('skips dot() inside template literal', () => {
    const source = 'const msg = `use dot(\'p-4\') here`;';
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it('still extracts real dot() after comment line', () => {
    const source = `// some comment\nconst style = dot('p-4');`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(1);
  });

  it('still extracts real dot() after block comment', () => {
    const source = `/* comment */ const style = dot('p-4');`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(1);
  });

  it('does not transform string containing dot()', () => {
    const source = `const msg = "call dot('p-4') later";`;
    const result = transformSource(source);
    expect(result).toBeNull();
  });

  it('does not transform comment containing dot()', () => {
    const source = `// dot('p-4')\nconst x = 1;`;
    const result = transformSource(source);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Fix 2: nested object serialization (native/flutter)
// ---------------------------------------------------------------------------
describe('nested structure serialization', () => {
  it('serializes native transform array correctly', () => {
    const source = `const style = dot('rotate-45', { target: 'native' });`;
    const result = transformSource(source);
    expect(result).not.toBeNull();
    // Should contain transform array, not [object Object]
    expect(result!.code).not.toContain('[object Object]');
    expect(result!.code).toContain('transform:');
  });

  it('serializes flutter recipe correctly', () => {
    const source = `const style = dot('p-4', { target: 'flutter' });`;
    const result = transformSource(source);
    expect(result).not.toBeNull();
    // Flutter produces nested { padding: { top: 16, ... } }
    expect(result!.code).not.toContain('[object Object]');
    expect(result!.code).toContain('padding:');
  });

  it('serializes flutter gradient recipe correctly', () => {
    const source = `const style = dot('bg-gradient-to-r from-red-500 to-blue-500', { target: 'flutter' });`;
    const result = transformSource(source);
    expect(result).not.toBeNull();
    expect(result!.code).not.toContain('[object Object]');
    expect(result!.code).toContain('decoration:');
    expect(result!.code).toContain('gradient:');
  });

  it('handles nested objects in styleToObjectLiteral', () => {
    const result = styleToObjectLiteral({
      transform: [{ rotate: '45deg' }, { scale: 1.1 }],
      padding: 16,
    } as Record<string, unknown>);
    expect(result).toContain('[{rotate: "45deg"}, {scale: 1.1}]');
    expect(result).toContain('padding: 16');
  });

  it('handles deeply nested flutter decoration', () => {
    const result = styleToObjectLiteral({
      decoration: { gradient: { type: 'linear', colors: ['#ff0000', '#0000ff'] } },
    } as Record<string, unknown>);
    expect(result).toContain('"linear"');
    expect(result).toContain('["#ff0000", "#0000ff"]');
  });
});

// ---------------------------------------------------------------------------
// Fix 3: breakpoint option handling
// ---------------------------------------------------------------------------
describe('breakpoint option handling', () => {
  it('skips extraction when breakpoint option is present', () => {
    const source = `const style = dot('md:p-8', { breakpoint: 'md' });`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it('does not transform source with breakpoint option', () => {
    const source = `const style = dot('md:p-8', { breakpoint: 'md' });`;
    const result = transformSource(source);
    expect(result).toBeNull();
  });

  it('skips breakpoint even with other options', () => {
    const source = `const style = dot('md:p-8', { target: 'native', breakpoint: 'md' });`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it('still extracts when no breakpoint option', () => {
    const source = `const style = dot('p-4', { target: 'web' });`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// styleToObjectLiteral
// ---------------------------------------------------------------------------
describe('styleToObjectLiteral', () => {
  it('converts empty object', () => {
    expect(styleToObjectLiteral({})).toBe('({})');
  });

  it('converts simple properties', () => {
    const result = styleToObjectLiteral({ padding: '16px', margin: '8px' });
    expect(result).toBe('({padding: "16px", margin: "8px"})');
  });

  it('converts numeric values', () => {
    const result = styleToObjectLiteral({ opacity: 0.5, zIndex: 10 });
    expect(result).toBe('({opacity: 0.5, zIndex: 10})');
  });

  it('escapes double quotes in string values', () => {
    const result = styleToObjectLiteral({ fontFamily: '"Inter", sans-serif' });
    expect(result).toContain('\\"Inter\\"');
  });

  it('handles boolean values', () => {
    const result = styleToObjectLiteral({ visible: true } as Record<string, unknown>);
    expect(result).toContain('visible: true');
  });

  it('handles null values', () => {
    const result = styleToObjectLiteral({ value: null } as Record<string, unknown>);
    expect(result).toContain('value: null');
  });
});

// ---------------------------------------------------------------------------
// transformSource
// ---------------------------------------------------------------------------
describe('transformSource', () => {
  it('replaces dot() calls with object literals', () => {
    const source = `const style = dot('p-4');`;
    const result = transformSource(source);
    expect(result).not.toBeNull();
    expect(result!.code).toContain('padding: "16px"');
    expect(result!.code).not.toContain("dot('p-4')");
    expect(result!.extractions).toBe(1);
  });

  it('returns null when no dot() calls found', () => {
    const source = `const x = 42;`;
    const result = transformSource(source);
    expect(result).toBeNull();
  });

  it('preserves surrounding code', () => {
    const source = `const before = 1;\nconst style = dot('p-4');\nconst after = 2;`;
    const result = transformSource(source);
    expect(result!.code).toContain('const before = 1;');
    expect(result!.code).toContain('const after = 2;');
  });

  it('handles multiple calls correctly', () => {
    const source = `const a = dot('p-4');\nconst b = dot('m-2');`;
    const result = transformSource(source);
    expect(result!.extractions).toBe(2);
    expect(result!.code).toContain('padding: "16px"');
    expect(result!.code).toContain('margin: "8px"');
  });

  it('handles empty dot() result', () => {
    const source = `const style = dot('bg-gradient-to-r');`;
    const result = transformSource(source);
    // bg-gradient-to-r alone produces empty (no color stops)
    expect(result!.code).toContain('({})');
  });
});
