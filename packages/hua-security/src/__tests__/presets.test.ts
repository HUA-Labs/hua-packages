import { describe, it, expect } from 'vitest';
import { RATE_LIMIT_PRESETS } from '../rate-limit/presets';
import type { RateLimitPresetName, RateLimitPreset } from '../rate-limit/presets';

describe('rate-limit presets', () => {
  it('should have all expected preset keys', () => {
    const keys = Object.keys(RATE_LIMIT_PRESETS);
    expect(keys).toContain('default');
    expect(keys).toContain('auth');
    expect(keys).toContain('diary');
    expect(keys).toContain('search');
    expect(keys).toContain('analyze');
    expect(keys).toContain('sensitive');
  });

  it('should have valid ipLimitPerMinute for all presets', () => {
    for (const [name, preset] of Object.entries(RATE_LIMIT_PRESETS)) {
      expect(preset.ipLimitPerMinute, `${name} ipLimitPerMinute`).toBeGreaterThan(0);
      expect(preset.ipLimitPerMinute, `${name} ipLimitPerMinute`).toBeLessThanOrEqual(1000);
    }
  });

  it('default preset should be most permissive', () => {
    expect(RATE_LIMIT_PRESETS.default.ipLimitPerMinute).toBe(60);
  });

  it('sensitive preset should be most restrictive', () => {
    const allLimits = Object.values(RATE_LIMIT_PRESETS).map(p => p.ipLimitPerMinute);
    expect(RATE_LIMIT_PRESETS.sensitive.ipLimitPerMinute).toBe(Math.min(...allLimits));
  });

  it('analyze preset should be stricter than default', () => {
    expect(RATE_LIMIT_PRESETS.analyze.ipLimitPerMinute).toBeLessThan(
      RATE_LIMIT_PRESETS.default.ipLimitPerMinute
    );
  });

  it('preset names should be type-safe', () => {
    const name: RateLimitPresetName = 'auth';
    const preset: RateLimitPreset = RATE_LIMIT_PRESETS[name];
    expect(preset.ipLimitPerMinute).toBe(20);
  });
});
