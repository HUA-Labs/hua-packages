import { describe, it, expect, beforeEach } from 'vitest';
import { dot, createDotConfig, clearDotCache } from '../../index';

describe('interactivity — cursor', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('resolves cursor-pointer', () => {
    expect(dot('cursor-pointer')).toEqual({ cursor: 'pointer' });
  });

  it('resolves cursor-default', () => {
    expect(dot('cursor-default')).toEqual({ cursor: 'default' });
  });

  it('resolves cursor-wait', () => {
    expect(dot('cursor-wait')).toEqual({ cursor: 'wait' });
  });

  it('resolves cursor-text', () => {
    expect(dot('cursor-text')).toEqual({ cursor: 'text' });
  });

  it('resolves cursor-move', () => {
    expect(dot('cursor-move')).toEqual({ cursor: 'move' });
  });

  it('resolves cursor-help', () => {
    expect(dot('cursor-help')).toEqual({ cursor: 'help' });
  });

  it('resolves cursor-not-allowed', () => {
    expect(dot('cursor-not-allowed')).toEqual({ cursor: 'not-allowed' });
  });

  it('resolves cursor-none', () => {
    expect(dot('cursor-none')).toEqual({ cursor: 'none' });
  });

  it('resolves cursor-grab', () => {
    expect(dot('cursor-grab')).toEqual({ cursor: 'grab' });
  });

  it('resolves cursor-grabbing', () => {
    expect(dot('cursor-grabbing')).toEqual({ cursor: 'grabbing' });
  });

  it('native target skips cursor', () => {
    const result = dot('cursor-pointer', { target: 'native' });
    expect(result).not.toHaveProperty('cursor');
  });
});

describe('interactivity — user-select', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('resolves select-none', () => {
    expect(dot('select-none')).toEqual({ userSelect: 'none' });
  });

  it('resolves select-text', () => {
    expect(dot('select-text')).toEqual({ userSelect: 'text' });
  });

  it('resolves select-all', () => {
    expect(dot('select-all')).toEqual({ userSelect: 'all' });
  });

  it('resolves select-auto', () => {
    expect(dot('select-auto')).toEqual({ userSelect: 'auto' });
  });

  it('native target skips userSelect', () => {
    const result = dot('select-none', { target: 'native' });
    expect(result).not.toHaveProperty('userSelect');
  });
});

describe('interactivity — resize', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('resolves resize', () => {
    expect(dot('resize')).toEqual({ resize: 'both' });
  });

  it('resolves resize-none', () => {
    expect(dot('resize-none')).toEqual({ resize: 'none' });
  });

  it('resolves resize-x', () => {
    expect(dot('resize-x')).toEqual({ resize: 'horizontal' });
  });

  it('resolves resize-y', () => {
    expect(dot('resize-y')).toEqual({ resize: 'vertical' });
  });

  it('native target skips resize', () => {
    const result = dot('resize', { target: 'native' });
    expect(result).not.toHaveProperty('resize');
  });
});

describe('interactivity — pointer-events', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('resolves pointer-events-none', () => {
    expect(dot('pointer-events-none')).toEqual({ pointerEvents: 'none' });
  });

  it('resolves pointer-events-auto', () => {
    expect(dot('pointer-events-auto')).toEqual({ pointerEvents: 'auto' });
  });

  it('native target passes pointer-events through', () => {
    const result = dot('pointer-events-none', { target: 'native' });
    expect(result).toEqual({ pointerEvents: 'none' });
  });
});

describe('interactivity — combined', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('combines interactivity with other utilities', () => {
    expect(dot('cursor-pointer select-none p-4')).toEqual({
      cursor: 'pointer',
      userSelect: 'none',
      padding: '16px',
    });
  });
});
