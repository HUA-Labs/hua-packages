/**
 * Storage Adapter interface
 *
 * For DB-backed rate limiting, abuse logging, etc.
 * Implement with Prisma, Redis, Supabase, etc.
 */

export interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
  increment(key: string, ttlMs?: number): Promise<number>;
}
