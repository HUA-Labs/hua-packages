import { describe, it, expect, beforeEach } from 'vitest';
import * as path from 'path';
import {
  loadTranslations,
  findKeysForValue,
  clearTranslationCache,
} from '../utils/translation-loader';

const fixturesDir = path.join(__dirname, 'fixtures', 'translations');

beforeEach(() => {
  clearTranslationCache();
});

describe('loadTranslations', () => {
  it('loads all namespaces from ko directory', () => {
    const map = loadTranslations(fixturesDir, 'ko');
    expect(map.keyToValue.size).toBeGreaterThan(0);
    expect(map.namespaceKeys.has('common')).toBe(true);
    expect(map.namespaceKeys.has('diary')).toBe(true);
    expect(map.namespaceKeys.has('settings')).toBe(true);
  });

  it('flattens nested keys with dot separator', () => {
    const map = loadTranslations(fixturesDir, 'ko');
    expect(map.keyToValue.get('common:actions.save')).toBe('저장');
    expect(map.keyToValue.get('common:actions.cancel')).toBe('취소');
    expect(map.keyToValue.get('diary:mood.happy')).toBe('행복');
  });

  it('builds valueToKeys reverse map', () => {
    const map = loadTranslations(fixturesDir, 'ko');

    // "저장" appears in common:actions.save and diary:save_button
    const saveKeys = map.valueToKeys.get('저장');
    expect(saveKeys).toBeDefined();
    expect(saveKeys!.has('common:actions.save')).toBe(true);
    expect(saveKeys!.has('diary:save_button')).toBe(true);
  });

  it('builds namespaceKeys map', () => {
    const map = loadTranslations(fixturesDir, 'ko');
    const commonKeys = map.namespaceKeys.get('common');
    expect(commonKeys).toBeDefined();
    expect(commonKeys!.has('common:welcome')).toBe(true);
    expect(commonKeys!.has('common:actions.save')).toBe(true);
  });

  it('caches results on second call', () => {
    const map1 = loadTranslations(fixturesDir, 'ko');
    const map2 = loadTranslations(fixturesDir, 'ko');
    expect(map1).toBe(map2); // Same reference
  });

  it('returns different maps for different languages', () => {
    const ko = loadTranslations(fixturesDir, 'ko');
    const en = loadTranslations(fixturesDir, 'en');
    expect(ko).not.toBe(en);
    expect(ko.keyToValue.get('common:welcome')).toBe('환영합니다');
    expect(en.keyToValue.get('common:welcome')).toBe('Welcome');
  });

  it('returns empty maps for nonexistent directory', () => {
    const map = loadTranslations('/nonexistent/path', 'ko');
    expect(map.keyToValue.size).toBe(0);
    expect(map.valueToKeys.size).toBe(0);
    expect(map.namespaceKeys.size).toBe(0);
  });

  it('handles top-level string values', () => {
    const map = loadTranslations(fixturesDir, 'ko');
    expect(map.keyToValue.get('common:welcome')).toBe('환영합니다');
    expect(map.keyToValue.get('diary:title')).toBe('오늘의 일기');
  });

  it('loads en translations correctly', () => {
    const map = loadTranslations(fixturesDir, 'en');
    expect(map.keyToValue.get('common:actions.save')).toBe('Save');
    expect(map.keyToValue.get('diary:mood.happy')).toBe('Happy');
  });
});

describe('findKeysForValue', () => {
  it('returns common namespace keys first', () => {
    const map = loadTranslations(fixturesDir, 'ko');
    const keys = findKeysForValue(map, '저장');
    expect(keys.length).toBeGreaterThanOrEqual(2);
    expect(keys[0]).toBe('common:actions.save');
  });

  it('returns empty array for unknown value', () => {
    const map = loadTranslations(fixturesDir, 'ko');
    const keys = findKeysForValue(map, '존재하지 않는 값');
    expect(keys).toHaveLength(0);
  });

  it('trims whitespace before lookup', () => {
    const map = loadTranslations(fixturesDir, 'ko');
    const keys = findKeysForValue(map, '  저장  ');
    expect(keys.length).toBeGreaterThanOrEqual(1);
  });

  it('sorts by key length as secondary sort', () => {
    const map = loadTranslations(fixturesDir, 'ko');
    // "확인" exists in common:actions.confirm and settings:confirm
    const keys = findKeysForValue(map, '확인');
    expect(keys.length).toBeGreaterThanOrEqual(2);
    // common first
    expect(keys[0]).toMatch(/^common:/);
    // Among same-priority, shorter key first
    for (let i = 1; i < keys.length; i++) {
      const prevCommon = keys[i - 1].startsWith('common:') ? 0 : 1;
      const currCommon = keys[i].startsWith('common:') ? 0 : 1;
      if (prevCommon === currCommon) {
        expect(keys[i].length).toBeGreaterThanOrEqual(keys[i - 1].length);
      }
    }
  });

  it('supports custom common namespace', () => {
    const map = loadTranslations(fixturesDir, 'ko');
    // Using "diary" as common namespace should sort diary keys first
    const keys = findKeysForValue(map, '저장', 'diary');
    expect(keys[0]).toBe('diary:save_button');
  });
});
