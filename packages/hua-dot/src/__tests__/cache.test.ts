import { describe, it, expect } from 'vitest';
import { DotCache } from '../cache';

describe('DotCache', () => {
  it('stores and retrieves input cache', () => {
    const cache = new DotCache();
    const style = { padding: '16px' };
    cache.setInput('p-4', style);
    expect(cache.getInput('p-4')).toBe(style);
  });

  it('stores and retrieves token cache', () => {
    const cache = new DotCache();
    const style = { padding: '16px' };
    cache.setToken('p-4', style);
    expect(cache.getToken('p-4')).toBe(style);
  });

  it('returns undefined for cache miss', () => {
    const cache = new DotCache();
    expect(cache.getInput('nonexistent')).toBeUndefined();
    expect(cache.getToken('nonexistent')).toBeUndefined();
  });

  it('evicts oldest entry when input cache exceeds max size', () => {
    const cache = new DotCache(3, 1000);

    cache.setInput('a', { padding: '1px' });
    cache.setInput('b', { padding: '2px' });
    cache.setInput('c', { padding: '3px' });
    expect(cache.inputSize).toBe(3);

    // Adding 4th should evict 'a' (FIFO)
    cache.setInput('d', { padding: '4px' });
    expect(cache.inputSize).toBe(3);
    expect(cache.getInput('a')).toBeUndefined();
    expect(cache.getInput('d')).toEqual({ padding: '4px' });
  });

  it('evicts oldest entry when token cache exceeds max size', () => {
    const cache = new DotCache(1000, 2);

    cache.setToken('a', { padding: '1px' });
    cache.setToken('b', { padding: '2px' });
    cache.setToken('c', { padding: '3px' });

    expect(cache.tokenSize).toBe(2);
    expect(cache.getToken('a')).toBeUndefined();
    expect(cache.getToken('c')).toEqual({ padding: '3px' });
  });

  it('clears both caches', () => {
    const cache = new DotCache();
    cache.setInput('a', { padding: '1px' });
    cache.setToken('b', { margin: '2px' });
    expect(cache.size).toBe(2);

    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.getInput('a')).toBeUndefined();
    expect(cache.getToken('b')).toBeUndefined();
  });

  it('reports size correctly', () => {
    const cache = new DotCache();
    expect(cache.size).toBe(0);

    cache.setInput('a', {});
    cache.setToken('b', {});
    expect(cache.size).toBe(2);
    expect(cache.inputSize).toBe(1);
    expect(cache.tokenSize).toBe(1);
  });

  describe('edge cases', () => {
    it('handles max size of 1', () => {
      const cache = new DotCache(1, 1);
      cache.setInput('a', { a: 1 });
      cache.setInput('b', { b: 2 });
      expect(cache.inputSize).toBe(1);
      expect(cache.getInput('a')).toBeUndefined();
      expect(cache.getInput('b')).toEqual({ b: 2 });
    });

    it('overwrites same key without evicting', () => {
      const cache = new DotCache(2, 2);
      cache.setInput('a', { v: 1 });
      cache.setInput('a', { v: 2 });
      expect(cache.inputSize).toBe(1);
      expect(cache.getInput('a')).toEqual({ v: 2 });
    });

    it('handles empty string keys', () => {
      const cache = new DotCache();
      cache.setInput('', { padding: '0px' });
      expect(cache.getInput('')).toEqual({ padding: '0px' });
      expect(cache.inputSize).toBe(1);
    });

    it('handles empty object values', () => {
      const cache = new DotCache();
      cache.setInput('empty', {});
      expect(cache.getInput('empty')).toEqual({});
    });

    it('input and token caches are independent', () => {
      const cache = new DotCache();
      cache.setInput('p-4', { padding: '16px' });
      // Same key in token cache shouldn't interfere
      cache.setToken('p-4', { padding: '32px' });
      expect(cache.getInput('p-4')).toEqual({ padding: '16px' });
      expect(cache.getToken('p-4')).toEqual({ padding: '32px' });
    });

    it('eviction order is FIFO even after reads', () => {
      // FIFO, not LRU — reading doesn't change eviction order
      const cache = new DotCache(3, 1000);
      cache.setInput('a', { a: 1 });
      cache.setInput('b', { b: 2 });
      cache.setInput('c', { c: 3 });
      // Read 'a' — in LRU this would protect it, but in FIFO it doesn't
      cache.getInput('a');
      cache.setInput('d', { d: 4 });
      expect(cache.getInput('a')).toBeUndefined(); // 'a' evicted despite read
      expect(cache.getInput('b')).toEqual({ b: 2 });
    });

    it('clear on already-empty cache is safe', () => {
      const cache = new DotCache();
      cache.clear();
      expect(cache.size).toBe(0);
      cache.clear();
      expect(cache.size).toBe(0);
    });

    it('handles rapid set/get interleaving', () => {
      const cache = new DotCache(100, 100);
      for (let i = 0; i < 50; i++) {
        cache.setInput(`key-${i}`, { idx: i });
        expect(cache.getInput(`key-${i}`)).toEqual({ idx: i });
      }
      expect(cache.inputSize).toBe(50);
    });
  });
});
