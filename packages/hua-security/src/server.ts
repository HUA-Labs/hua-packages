/**
 * @hua-labs/security/server
 *
 * Server-only exports for Next.js App Router.
 * Includes 'server-only' guard to prevent accidental client-side imports.
 *
 * @example
 * ```typescript
 * import { encryptSmart, decryptSmart } from '@hua-labs/security/server';
 * ```
 */

import 'server-only';

export * from './index';
