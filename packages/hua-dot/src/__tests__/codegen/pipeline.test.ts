import { describe, it, expect, beforeEach } from 'vitest';
import { createDotConfig, clearDotCache } from '../../index';
import {
  extractStylesFromSource,
  extractStylesFromJSON,
  resolveToIR,
  codegen,
} from '../../codegen/pipeline';
import { StubEmitter } from '../../codegen/stub-emitter';
import { main } from '../../codegen/cli';

describe('[CRITICAL-1] CLI main() is callable', () => {
  it('main() is exported and callable', () => {
    expect(typeof main).toBe('function');
  });

  it('main() with no args does not throw', () => {
    // With empty argv, should print usage and return (not process.exit)
    expect(() => main([])).not.toThrow();
  });
});

describe('extractStylesFromSource()', () => {
  it('extracts exported const dot() calls', () => {
    const source = `
      import { dot } from '@hua-labs/dot';
      export const cardBase = dot('p-4 bg-white rounded-lg');
      export const heading = dot("text-2xl font-bold");
    `;
    const defs = extractStylesFromSource(source);
    expect(defs).toEqual([
      { name: 'cardBase', input: 'p-4 bg-white rounded-lg' },
      { name: 'heading', input: 'text-2xl font-bold' },
    ]);
  });

  it('extracts non-exported const dot() calls', () => {
    const source = `
      const btn = dot('px-4 py-2 bg-primary-500 text-white');
    `;
    const defs = extractStylesFromSource(source);
    expect(defs).toEqual([
      { name: 'btn', input: 'px-4 py-2 bg-primary-500 text-white' },
    ]);
  });

  it('extracts let declarations', () => {
    const source = `let foo = dot('flex items-center');`;
    const defs = extractStylesFromSource(source);
    expect(defs).toEqual([
      { name: 'foo', input: 'flex items-center' },
    ]);
  });

  it('returns empty array for source with no dot() calls', () => {
    const source = `const x = 42; const y = "hello";`;
    const defs = extractStylesFromSource(source);
    expect(defs).toEqual([]);
  });

  it('handles multiple styles in one file', () => {
    const source = `
      export const a = dot('p-1');
      export const b = dot('p-2');
      export const c = dot('p-3');
      export const d = dot('p-4');
    `;
    const defs = extractStylesFromSource(source);
    expect(defs).toHaveLength(4);
    expect(defs.map(d => d.name)).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('extractStylesFromJSON()', () => {
  it('parses valid JSON definitions', () => {
    const json = JSON.stringify({
      styles: {
        card: 'p-4 rounded-lg',
        title: 'text-xl font-bold',
      },
    });
    const defs = extractStylesFromJSON(json);
    expect(defs).toEqual([
      { name: 'card', input: 'p-4 rounded-lg' },
      { name: 'title', input: 'text-xl font-bold' },
    ]);
  });

  it('throws on missing styles key', () => {
    expect(() => extractStylesFromJSON('{}')).toThrow(/styles/);
  });

  it('throws on invalid JSON', () => {
    expect(() => extractStylesFromJSON('not json')).toThrow();
  });
});

describe('resolveToIR()', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('resolves definitions to IR nodes', () => {
    const defs = [
      { name: 'card', input: 'p-4 bg-white' },
      { name: 'title', input: 'text-xl font-bold' },
    ];
    const irNodes = resolveToIR(defs);
    expect(irNodes).toHaveLength(2);
    expect(irNodes[0].name).toBe('card');
    expect(irNodes[0].padding).toBeDefined();
    expect(irNodes[1].name).toBe('title');
    expect(irNodes[1].typography).toBeDefined();
  });

  it('[CRITICAL-2] resolves correctly even when global runtime is native', () => {
    // codegen must always use web target internally, regardless of global config
    createDotConfig({ runtime: 'native' });
    const defs = [
      { name: 'card', input: 'p-4 bg-white rounded-lg shadow-md' },
    ];
    // Should NOT throw TypeError: val.replace is not a function
    const irNodes = resolveToIR(defs);
    expect(irNodes).toHaveLength(1);
    expect(irNodes[0].padding).toEqual({ top: 16, right: 16, bottom: 16, left: 16 });
    expect(irNodes[0].colors?.background).toBe('#ffffff');
    expect(irNodes[0].border?.radius).toBeDefined();
  });
});

describe('codegen()', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('produces output via stub emitter', () => {
    const defs = [
      { name: 'card', input: 'p-4 bg-white rounded-lg' },
    ];
    const emitter = new StubEmitter('swift');
    const result = codegen(defs, emitter, {
      target: 'swift',
      moduleName: 'TestStyles',
    });

    expect(result.target).toBe('swift');
    expect(result.fileName).toBe('TestStyles.swift');
    expect(result.styleCount).toBe(1);
    expect(result.content).toContain('TestStyles');
    expect(result.content).toContain('card');
  });

  it('handles multiple styles', () => {
    const defs = [
      { name: 'a', input: 'p-1' },
      { name: 'b', input: 'p-2' },
      { name: 'c', input: 'p-3' },
    ];
    const emitter = new StubEmitter('compose');
    const result = codegen(defs, emitter, { target: 'compose' });

    expect(result.target).toBe('compose');
    expect(result.fileName).toBe('DotStyles.kt');
    expect(result.styleCount).toBe(3);
  });

  it('snapshot: full pipeline output for card style', () => {
    const defs = [
      { name: 'cardBase', input: 'p-4 bg-white rounded-lg shadow-md' },
      { name: 'heading', input: 'text-2xl font-bold text-gray-900' },
    ];
    const emitter = new StubEmitter('swift');
    const result = codegen(defs, emitter, {
      target: 'swift',
      moduleName: 'AppStyles',
    });
    expect(result.content).toMatchSnapshot();
  });
});
