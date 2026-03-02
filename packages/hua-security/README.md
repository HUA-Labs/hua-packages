# @hua-labs/security

Unified security toolkit with Free/Pro tiers. Free tier provides encryption (AES-256-GCM, PBKDF2), rate limiting (memory + Redis), password validation, and key management with zero external dependencies. Pro tier adds KMS envelope encryption, abuse pattern detection, and token estimation.

[![npm version](https://img.shields.io/npm/v/@hua-labs/security.svg)](https://www.npmjs.com/package/@hua-labs/security)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/security.svg)](https://www.npmjs.com/package/@hua-labs/security)
[![license](https://img.shields.io/npm/l/@hua-labs/security.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **Envelope encryption — KMS-managed keys with AES-256-GCM + PBKDF2 fallback**
- **Smart detection — Auto-detects KMS (v2) and legacy PBKDF2 formats**
- **Rate limiting — Memory + Storage-backed (Redis), with built-in presets**
- **Password validation — Strength checks with bilingual error messages**
- **Client identity — Framework-agnostic IP/UA extraction and bot detection**
- **Key management — Config-based key rotation without app dependencies**
- **Abuse detection — Jailbreak/injection pattern matching engine**
- **Token estimation — LLM operation cost estimation**
- **Invisible CAPTCHA — Behavioral bot detection (browser-only)**

## Installation

```bash
pnpm add @hua-labs/security
```

> Peer dependencies: @google-cloud/kms ^5.3.0, next >=14.0.0

## Quick Start

```typescript
import {
  encryptSmart, decryptSmart,
  createMemoryRateLimiter, createStorageRateLimiter,
  RATE_LIMIT_PRESETS,
} from '@hua-labs/security';
import { createRedisAdapter } from '@hua-labs/security/adapters';

// Encrypt (uses KMS if available, otherwise PBKDF2)
const encrypted = await encryptSmart('sensitive data');
const decrypted = await decryptSmart(encrypted);

// Rate limiting (in-memory)
const limiter = createMemoryRateLimiter();
const result = await limiter.checkRateLimit('user-123', '1.2.3.4', RATE_LIMIT_PRESETS.auth);

// Rate limiting (Redis-backed)
const adapter = createRedisAdapter({ client: redis });
const distributed = createStorageRateLimiter(adapter);
const res = await distributed.checkRateLimit('user-123', '1.2.3.4', RATE_LIMIT_PRESETS.analyze);

```

## API

| Export | Type | Description |
|--------|------|-------------|
| `ENCRYPTION_CONSTANTS` | component |  |
| `encryptSmart` | function | Encrypt with best available method (KMS or PBKDF2) |
| `decryptSmart` | function | Decrypt with auto-format detection |
| `getEncryptionMethod` | function |  |
| `pbkdf2Encrypt` | function |  |
| `pbkdf2Decrypt` | function |  |
| `isPBKDF2Format` | function |  |
| `generateSecureKey` | function |  |
| `checkKeyStrength` | function |  |
| `hashSHA256` | function |  |
| `hashSHA512` | function |  |
| `createHMAC` | function |  |
| `verifyHMAC` | function |  |
| `secureCompare` | function |  |
| `hashUserData` | function |  |
| `isKMSEnabled` | function |  |
| `envelopeEncrypt` | function | Direct KMS envelope encryption |
| `envelopeDecrypt` | function | Direct KMS envelope decryption |
| `isEnvelopeFormat` | function |  |
| `resetKMSClient` | function |  |
| `createMemoryRateLimiter` | function | Create in-memory rate limiter instance |
| `RateLimitExceededError` | component |  |
| `createStorageRateLimiter` | function | Create storage-backed rate limiter (Redis, DB) |
| `RATE_LIMIT_PRESETS` | const | Built-in presets (default, auth, diary, search, analyze, sensitive) |
| `validatePassword` | function | Validate password strength with bilingual messages |
| `getClientIP` | function | Extract client IP from request headers |
| `getUserAgent` | function | Extract user agent from request headers |
| `isAllowedBot` | function |  |
| `isNormalMobileUserAgent` | function |  |
| `isSuspiciousUserAgent` | function |  |
| `KeyManager` | class | Config-based encryption key manager |
| `EncryptionConfig` | type |  |
| `EncryptedPayload` | type |  |
| `RateLimitResult` | type |  |
| `MemoryRateLimiterConfig` | type |  |
| `RateLimitPreset` | type |  |
| `RateLimitPresetName` | type |  |
| `RequestWithHeaders` | type |  |
| `KeyType` | type |  |
| `KeyInfo` | type |  |
| `KeyManagerConfig` | type |  |


## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)

## License

MIT — [HUA Labs](https://hua-labs.com)
