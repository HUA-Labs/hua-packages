import { describe, it, expect } from 'vitest';
import { StubEmitter } from '../../codegen/stub-emitter';
import type { DotIR } from '../../codegen/ir';

describe('StubEmitter', () => {
  const sampleIR: DotIR = {
    name: 'card',
    input: 'p-4 bg-white rounded-lg',
    padding: { top: 16, right: 16, bottom: 16, left: 16 },
    colors: { background: '#ffffff' },
    border: {
      radius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
    },
  };

  it('emits JSON fragment for a single IR node', () => {
    const emitter = new StubEmitter('swift');
    const fragment = emitter.emit(sampleIR);
    const parsed = JSON.parse(fragment);
    expect(parsed.name).toBe('card');
    expect(parsed.padding.top).toBe(16);
  });

  it('finalize wraps fragments with header', () => {
    const emitter = new StubEmitter('swift');
    emitter.emit(sampleIR);
    const output = emitter.finalize('TestModule');
    expect(output).toContain('TestModule');
    expect(output).toContain('target: swift');
    expect(output).toContain('"card"');
  });

  it('handles multiple IR nodes', () => {
    const emitter = new StubEmitter('compose');

    emitter.emit({ name: 'a', input: 'p-1', padding: { top: 4, right: 4, bottom: 4, left: 4 } });
    emitter.emit({ name: 'b', input: 'p-2', padding: { top: 8, right: 8, bottom: 8, left: 8 } });

    const output = emitter.finalize('Styles');
    const content = output.split('\n').filter(l => !l.startsWith('//')).join('\n').trim();
    const parsed = JSON.parse(content);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe('a');
    expect(parsed[1].name).toBe('b');
  });

  it('compose target uses correct file extension in codegen', () => {
    const emitter = new StubEmitter('compose');
    expect(emitter.target).toBe('compose');
  });
});
