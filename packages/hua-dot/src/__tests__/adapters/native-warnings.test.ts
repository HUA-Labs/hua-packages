import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adaptNative, _resetNativeWarnings } from '../../adapters/native';
import { dot, createDotConfig, clearDotCache } from '../../index';

describe('adaptNative — warnDropped', () => {
  beforeEach(() => {
    _resetNativeWarnings();
    vi.restoreAllMocks();
  });

  it('warns on dropped SKIP_PROPS when warnDropped=true', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    adaptNative(
      { transitionProperty: 'all', transitionDuration: '300ms', padding: '16px' },
      { warnDropped: true },
    );

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('[dot/native] Dropped: "transitionProperty"');
    expect(spy).toHaveBeenCalledWith('[dot/native] Dropped: "transitionDuration"');
  });

  it('does not warn when warnDropped=false', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    adaptNative(
      { transitionProperty: 'all', cursor: 'pointer' },
      { warnDropped: false },
    );

    expect(spy).not.toHaveBeenCalled();
  });

  it('does not warn when warnDropped is omitted', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    adaptNative({ cursor: 'pointer', animation: 'spin 1s linear infinite' });

    expect(spy).not.toHaveBeenCalled();
  });

  it('deduplicates warnings — same prop only warned once per session', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    adaptNative({ cursor: 'pointer' }, { warnDropped: true });
    adaptNative({ cursor: 'pointer' }, { warnDropped: true });
    adaptNative({ cursor: 'pointer' }, { warnDropped: true });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('warns after _resetNativeWarnings clears dedup set', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    adaptNative({ cursor: 'pointer' }, { warnDropped: true });
    expect(spy).toHaveBeenCalledTimes(1);

    _resetNativeWarnings();

    adaptNative({ cursor: 'pointer' }, { warnDropped: true });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('warns on unsupported display values', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = adaptNative(
      { display: 'grid' as string },
      { warnDropped: true },
    );

    expect(result).not.toHaveProperty('display');
    expect(spy).toHaveBeenCalledWith(
      '[dot/native] Dropped: "display:grid" (unsupported display value "grid")',
    );
  });

  it('does not warn for supported display values (flex, none)', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = adaptNative({ display: 'flex' }, { warnDropped: true });

    expect(result).toHaveProperty('display', 'flex');
    expect(spy).not.toHaveBeenCalled();
  });

  it('still converts valid properties normally when warnDropped=true', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = adaptNative(
      { padding: '16px', cursor: 'pointer', backgroundColor: '#fff' },
      { warnDropped: true },
    );

    expect(result).toEqual({ padding: 16, backgroundColor: '#fff' });
  });
});

describe('dot() integration — warnUnknown config → adaptNative warnDropped', () => {
  beforeEach(() => {
    _resetNativeWarnings();
    vi.restoreAllMocks();
  });

  it('forwards warnUnknown to adaptNative when target=native', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    createDotConfig({ warnUnknown: true });
    clearDotCache();

    dot('transition-all duration-300 p-4', { target: 'native' });

    // transition-all → transitionProperty: 'all' → dropped
    // duration-300 → transitionDuration: '300ms' → dropped
    const nativeWarnings = spy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].startsWith('[dot/native]'),
    );
    expect(nativeWarnings.length).toBeGreaterThanOrEqual(1);

    // Reset config
    createDotConfig();
    clearDotCache();
  });

  it('suppresses warnings when warnUnknown=false', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    createDotConfig({ warnUnknown: false });
    clearDotCache();

    dot('transition-all cursor-pointer p-4', { target: 'native' });

    const nativeWarnings = spy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].startsWith('[dot/native]'),
    );
    expect(nativeWarnings).toHaveLength(0);

    // Reset config
    createDotConfig();
    clearDotCache();
  });
});
