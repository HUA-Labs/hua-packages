import { describe, it, expect } from 'vitest';
import { levenshtein, findClosestKeys } from '../utils/levenshtein';

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('hello', 'hello')).toBe(0);
  });

  it('returns length for empty vs non-empty', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
  });

  it('returns 0 for both empty', () => {
    expect(levenshtein('', '')).toBe(0);
  });

  it('handles single character difference', () => {
    expect(levenshtein('cat', 'bat')).toBe(1);
    expect(levenshtein('cat', 'car')).toBe(1);
    expect(levenshtein('cat', 'cats')).toBe(1);
  });

  it('handles multiple differences', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('sunday', 'saturday')).toBe(3);
  });

  it('handles i18n key-like strings', () => {
    expect(levenshtein('common:save', 'common:sav')).toBe(1);
    expect(levenshtein('common:actions.save', 'common:actions.sav')).toBe(1);
    expect(levenshtein('diary:titl', 'diary:title')).toBe(1);
  });

  it('is symmetric', () => {
    expect(levenshtein('abc', 'def')).toBe(levenshtein('def', 'abc'));
    expect(levenshtein('foo', 'bar')).toBe(levenshtein('bar', 'foo'));
  });
});

describe('findClosestKeys', () => {
  const candidates = [
    'common:welcome',
    'common:goodbye',
    'common:actions.save',
    'common:actions.cancel',
    'common:actions.delete',
    'diary:title',
    'diary:save_button',
    'user:profile.name',
    'user:profile.email',
    'user:settings.theme',
  ];

  it('finds exact typo matches', () => {
    const results = findClosestKeys('common:welcom', candidates);
    expect(results[0].key).toBe('common:welcome');
    expect(results[0].distance).toBe(1);
  });

  it('finds multiple close matches', () => {
    const results = findClosestKeys('common:actions.sav', candidates);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].key).toBe('common:actions.save');
  });

  it('returns empty for no close matches', () => {
    const results = findClosestKeys('xyz:completely.different', candidates);
    expect(results).toHaveLength(0);
  });

  it('respects maxDistance', () => {
    const results = findClosestKeys('common:welcom', candidates, 1);
    expect(results.every((r) => r.distance <= 1)).toBe(true);
  });

  it('respects maxResults', () => {
    const results = findClosestKeys('common:actions.save', candidates, 3, 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('does not include exact match (distance 0)', () => {
    const results = findClosestKeys('common:welcome', candidates);
    expect(results.every((r) => r.distance > 0)).toBe(true);
  });

  it('works with Set iterable', () => {
    const candidateSet = new Set(candidates);
    const results = findClosestKeys('diary:titl', candidateSet);
    expect(results[0].key).toBe('diary:title');
  });

  it('sorts by distance ascending', () => {
    const results = findClosestKeys('common:actions.dele', candidates, 3);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].distance).toBeGreaterThanOrEqual(
        results[i - 1].distance,
      );
    }
  });
});
