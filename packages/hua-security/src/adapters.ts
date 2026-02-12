/**
 * @hua-labs/security/adapters
 *
 * Abstract interfaces for storage and external providers.
 *
 * @example
 * ```typescript
 * import type { StorageAdapter } from '@hua-labs/security/adapters';
 * import { createRedisAdapter } from '@hua-labs/security/adapters';
 * ```
 */

export type { StorageAdapter } from './adapters/storage';
export { createRedisAdapter } from './adapters/redis';
export type { RedisAdapterConfig, RedisLikeClient } from './adapters/redis';
