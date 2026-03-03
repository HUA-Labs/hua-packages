import { describe, it, expect, vi } from 'vitest';
import { resolveToken } from '../../resolver';
import { resolveConfig } from '../../config';

describe('warnUnknown (dev mode warnings)', () => {
  it('warns on unknown standalone token when warnUnknown is true', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = resolveConfig({ warnUnknown: true });
    const token = { variants: [], prefix: '', value: 'foo-bar-baz', raw: 'foo-bar-baz', negative: false, important: false };

    resolveToken(token, config);
    expect(warnSpy).toHaveBeenCalledWith('[dot] Unknown token: "foo-bar-baz"');
    warnSpy.mockRestore();
  });

  it('warns on unknown prefix-value token when warnUnknown is true', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = resolveConfig({ warnUnknown: true });
    const token = { variants: [], prefix: 'xyz', value: '99', raw: 'xyz-99', negative: false, important: false };

    resolveToken(token, config);
    expect(warnSpy).toHaveBeenCalledWith('[dot] Unknown token: "xyz-99"');
    warnSpy.mockRestore();
  });

  it('warns when resolver found but value not recognized', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = resolveConfig({ warnUnknown: true });
    const token = { variants: [], prefix: 'p', value: 'banana', raw: 'p-banana', negative: false, important: false };

    resolveToken(token, config);
    expect(warnSpy).toHaveBeenCalledWith('[dot] Unknown token: "p-banana"');
    warnSpy.mockRestore();
  });

  it('does NOT warn when warnUnknown is false', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = resolveConfig({ warnUnknown: false });
    const token = { variants: [], prefix: '', value: 'nope', raw: 'nope', negative: false, important: false };

    resolveToken(token, config);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('strictMode takes precedence over warnUnknown', () => {
    const config = resolveConfig({ strictMode: true, warnUnknown: true });
    const token = { variants: [], prefix: '', value: 'nope', raw: 'nope', negative: false, important: false };

    expect(() => resolveToken(token, config)).toThrow('[dot] Unknown token: "nope"');
  });
});
