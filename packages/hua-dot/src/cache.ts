import type { StyleObject, RNStyleObject } from './types';

/** Cached output can be either web or native style */
type CachedOutput = StyleObject | RNStyleObject;

/**
 * 2-layer FIFO cache for dot() style resolution.
 *
 * Layer 1 (input cache): Full input string → merged StyleObject or RNStyleObject.
 *   Skips both parsing and resolving on cache hit.
 *
 * Layer 2 (token cache): Individual token string → StyleObject (always web format).
 *   Skips resolving but still requires parsing.
 */
export class DotCache {
  private inputCache: Map<string, CachedOutput>;
  private tokenCache: Map<string, StyleObject>;
  private inputMaxSize: number;
  private tokenMaxSize: number;

  constructor(inputMaxSize = 500, tokenMaxSize = 1000) {
    this.inputCache = new Map();
    this.tokenCache = new Map();
    this.inputMaxSize = inputMaxSize;
    this.tokenMaxSize = tokenMaxSize;
  }

  /** Layer 1: Look up full input string */
  getInput(input: string): CachedOutput | undefined {
    return this.inputCache.get(input);
  }

  /** Layer 2: Look up individual token */
  getToken(token: string): StyleObject | undefined {
    return this.tokenCache.get(token);
  }

  /** Store full input result in Layer 1 */
  setInput(input: string, result: CachedOutput): void {
    if (this.inputCache.size >= this.inputMaxSize) {
      // FIFO eviction: delete oldest entry
      const firstKey = this.inputCache.keys().next().value;
      if (firstKey !== undefined) {
        this.inputCache.delete(firstKey);
      }
    }
    this.inputCache.set(input, result);
  }

  /** Store individual token result in Layer 2 */
  setToken(token: string, result: StyleObject): void {
    if (this.tokenCache.size >= this.tokenMaxSize) {
      const firstKey = this.tokenCache.keys().next().value;
      if (firstKey !== undefined) {
        this.tokenCache.delete(firstKey);
      }
    }
    this.tokenCache.set(token, result);
  }

  /** Clear both caches */
  clear(): void {
    this.inputCache.clear();
    this.tokenCache.clear();
  }

  /** Total entries across both caches */
  get size(): number {
    return this.inputCache.size + this.tokenCache.size;
  }

  get inputSize(): number {
    return this.inputCache.size;
  }

  get tokenSize(): number {
    return this.tokenCache.size;
  }
}
