# @hua-labs/security Detailed Guide

Unified security toolkit for the HUA platform with Free/Pro tier separation and multiple entry points.

---

## Architecture

### Entry Points

| Import Path | Environment | Purpose |
|-------------|-------------|---------|
| `@hua-labs/security` | All (Node, Edge, React) | Core — encryption, rate limiting, password, identity |
| `@hua-labs/security/server` | Next.js RSC only | Re-exports core + `server-only` build guard |
| `@hua-labs/security/pro` | Node.js | KMS, abuse detection, token estimation |
| `@hua-labs/security/client` | Browser only | Invisible CAPTCHA |
| `@hua-labs/security/adapters` | Node.js | StorageAdapter interface, Redis adapter |

**Decision tree:**
- Next.js App Router Server Component → use `/server` (prevents accidental client import)
- Next.js Route Handler / API / any Node.js → use main `@hua-labs/security`
- React (non-Next.js) → use main `@hua-labs/security` directly
- Browser component → use `/client` for CAPTCHA only

### Tier System

```
Free Tier (@hua-labs/security)
├── Encryption (AES-256-GCM, PBKDF2, smart auto-select)
├── Rate Limiting (memory + storage-backed)
├── Rate Limit Presets
├── Password Validation
├── Client Identity (IP/UA extraction, bot detection)
└── Key Management

Pro Tier (@hua-labs/security/pro)
├── KMS Envelope Encryption (GCP Cloud KMS)
├── Abuse Pattern Engine (jailbreak/injection detection)
└── Token Estimation (LLM cost calculation)

Client Tier (@hua-labs/security/client)
└── Invisible CAPTCHA (behavioral bot detection)
```

---

## Encryption

### Smart Encryption (Recommended)

Automatically selects the best encryption method available. Uses KMS envelope encryption when `GCP_KMS_KEY_NAME` is set, otherwise falls back to PBKDF2.

```typescript
import { encryptSmart, decryptSmart, getEncryptionMethod } from '@hua-labs/security';

// Check which method will be used
const method = getEncryptionMethod(); // 'kms' | 'pbkdf2'

// Encrypt — auto-selects KMS or PBKDF2
const encrypted = await encryptSmart('sensitive diary content');

// Decrypt — auto-detects format from the data prefix
const decrypted = await decryptSmart(encrypted);
```

### Format Detection

The encrypted data's first byte determines the format:
- `0x02` → Envelope encryption (KMS)
- Other → Legacy PBKDF2 format

```typescript
import { isEnvelopeFormat, isPBKDF2Format } from '@hua-labs/security';

if (isEnvelopeFormat(data)) {
  // KMS encrypted — requires GCP_KMS_KEY_NAME to decrypt
} else if (isPBKDF2Format(data)) {
  // Legacy PBKDF2 — requires ENCRYPTION_KEY env var
}
```

### KMS Envelope Encryption (Pro)

Direct KMS usage for when you need explicit control:

```typescript
import { envelopeEncrypt, envelopeDecrypt, isKMSEnabled } from '@hua-labs/security/pro';

if (isKMSEnabled()) {
  const encrypted = await envelopeEncrypt(plainText);
  const decrypted = await envelopeDecrypt(encrypted);
}
```

**Environment variables:**
- `GCP_KMS_KEY_NAME` — KMS key resource path (`projects/{project}/locations/{loc}/keyRings/{ring}/cryptoKeys/{key}`)
- `GCP_KMS_CREDENTIALS` — Service account JSON (base64) or file path (optional in GCP environments)

### Crypto Utilities

```typescript
import {
  generateSecureKey,    // Generate random hex key
  checkKeyStrength,     // Validate key entropy
  hashSHA256,           // SHA-256 hash
  hashSHA512,           // SHA-512 hash
  createHMAC,           // HMAC-SHA256
  verifyHMAC,           // Constant-time HMAC verification
  secureCompare,        // Timing-safe string comparison
  hashUserData,         // Hash user identifiers for analytics
} from '@hua-labs/security';
```

---

## Rate Limiting

### Memory Rate Limiter

Zero-dependency, Edge Runtime compatible. Best for single-instance or serverless (with caveat that limits aren't shared across instances).

```typescript
import { createMemoryRateLimiter, RateLimitExceededError } from '@hua-labs/security';

const limiter = createMemoryRateLimiter();

// Individual checks
const userResult = await limiter.checkUserRateLimit('user-123', 10);  // 10 req/min
const ipResult = await limiter.checkIpRateLimit('1.2.3.4', 100);     // 100 req/min

// Combined check (IP first, then user)
const result = await limiter.checkRateLimit('user-123', '1.2.3.4', {
  ipLimitPerMinute: 60,
  userLimitPerMinute: 10,
});

if (!result.allowed) {
  // result.blockedBy → 'ip' | 'user' (tells you which limiter blocked)
  throw new RateLimitExceededError('Too many requests', result.resetAt);
}

// Penalty: reduce a user's limit temporarily
limiter.setUserRateLimit('abusive-user', 3); // 3 req/min
```

### Storage Rate Limiter (Redis)

Distributed rate limiting across multiple instances. Same API as memory limiter but backed by StorageAdapter.

```typescript
import { createStorageRateLimiter } from '@hua-labs/security';
import { createRedisAdapter } from '@hua-labs/security/adapters';

// 1. Create adapter (inject your Redis client)
const adapter = createRedisAdapter({
  client: redis,        // ioredis, @upstash/redis, or node-redis instance
  keyPrefix: 'hua:',    // default, avoids key collisions
});

// 2. Create limiter
const limiter = createStorageRateLimiter(adapter);

// 3. Same API as memory limiter
const result = await limiter.checkRateLimit('user-123', '1.2.3.4', {
  ipLimitPerMinute: 60,
  userLimitPerMinute: 10,
});
```

**Key design:** The `RedisLikeClient` interface is minimal (`get`, `set`, `del`, `incr`, `expire`, `ttl`) — compatible with ioredis, @upstash/redis, and node-redis without extra dependencies.

### Rate Limit Presets

Built-in configurations for common endpoint types:

```typescript
import { RATE_LIMIT_PRESETS } from '@hua-labs/security';
import type { RateLimitPresetName } from '@hua-labs/security';

// Use directly with checkRateLimit
await limiter.checkRateLimit(userId, ip, RATE_LIMIT_PRESETS.auth);
await limiter.checkRateLimit(userId, ip, RATE_LIMIT_PRESETS.analyze);
```

| Preset | `ipLimitPerMinute` | Use Case |
|--------|-------------------|----------|
| `default` | 60 | General API endpoints |
| `auth` | 20 | Login, register, password reset |
| `diary` | 30 | Diary CRUD operations |
| `search` | 30 | Search endpoints |
| `analyze` | 10 | AI analysis endpoints |
| `sensitive` | 5 | Password change, account delete |

### Choosing Memory vs Storage

| Concern | Memory | Storage (Redis) |
|---------|--------|-----------------|
| Setup | Zero config | Requires Redis |
| Shared state | Per-instance only | Shared across instances |
| Edge Runtime | Yes | Depends on Redis client |
| Production multi-instance | Not recommended | Recommended |
| Serverless | Works (limits reset per cold start) | Persistent |

---

## Password Validation

Bilingual error messages (Korean/English):

```typescript
import { validatePassword } from '@hua-labs/security';

const { isValid, errors } = validatePassword('weak');
// errors: ['8자 이상 / At least 8 characters', '대문자 포함 / Uppercase letter', ...]
```

**Rules:** min 8 chars, uppercase, lowercase, number, special char, no spaces, no 3+ consecutive identical chars.

---

## Client Identity

Framework-agnostic request parsing. Works with Next.js, Express, or raw `Request` objects.

```typescript
import {
  getClientIP,
  getUserAgent,
  isSuspiciousUserAgent,
  isAllowedBot,
  isNormalMobileUserAgent,
} from '@hua-labs/security';

const ip = getClientIP(request);       // Checks x-forwarded-for, x-real-ip, etc.
const ua = getUserAgent(request);

if (isSuspiciousUserAgent(ua)) {
  // Headless browsers, known scrapers
}

if (isAllowedBot(ua)) {
  // Googlebot, Bingbot, etc. — skip rate limiting
}
```

---

## Key Management

Config-based encryption key rotation:

```typescript
import { KeyManager } from '@hua-labs/security';
import type { KeyManagerConfig } from '@hua-labs/security';

const config: KeyManagerConfig = {
  keys: [
    { id: 'v2', type: 'aes-256-gcm', value: process.env.ENCRYPTION_KEY_V2!, active: true },
    { id: 'v1', type: 'aes-256-gcm', value: process.env.ENCRYPTION_KEY_V1!, active: false },
  ],
};

const km = new KeyManager(config);
const activeKey = km.getActiveKey();    // Returns 'v2' key
const oldKey = km.getKey('v1');         // For decrypting old data
```

---

## Abuse Detection (Pro)

Pure pattern engine — no DB, no request handling. App-level code handles logging and penalties.

```typescript
import {
  shouldSkipAnalysis,
  matchAbusePatterns,
  ABUSE_DETECTION_CONFIG,
} from '@hua-labs/security/pro';

// Quick check — returns true if content matches jailbreak/injection patterns
if (shouldSkipAnalysis(userInput)) {
  // Block or flag the request
}

// Detailed pattern matching
const matches = matchAbusePatterns(userInput);
// Returns: { pattern: AbusePattern, severity: PenaltyLevel }[]
```

**Detected patterns:** `RAPID_REQUESTS`, `REPETITIVE_CONTENT`, `SUSPICIOUS_PROMPTS`, `TOKEN_ABUSE`, `MULTI_ACCOUNT`, `API_SCRAPING`

**Penalty levels:** `WARNING` → `RATE_LIMIT` → `TEMPORARY_BAN` → `PERMANENT_BAN`

---

## Token Estimation (Pro)

Estimate LLM operation costs before making API calls:

```typescript
import {
  estimateTokens,
  estimateOperationTokens,
  DEFAULT_PRICING,
} from '@hua-labs/security/pro';

// Simple token count estimate
const tokens = estimateTokens('Hello, how are you?');

// Full operation cost estimate
const estimate = estimateOperationTokens('analyze', inputText);
// Returns: { inputTokens, outputTokens, estimatedCost }
```

---

## Invisible CAPTCHA (Client)

Behavioral bot detection for browser environments. No user interaction required.

```typescript
import {
  initInvisibleCaptcha,
  startCaptcha,
  stopCaptcha,
  checkCaptchaScore,
  validateCaptcha,
} from '@hua-labs/security/client';

// Initialize on page load
initInvisibleCaptcha();

// Start tracking user behavior
startCaptcha();

// Check score before sensitive operations
const score = checkCaptchaScore();
const isHuman = validateCaptcha(score);

// Cleanup
stopCaptcha();
```

---

## Adapters

### StorageAdapter Interface

The core abstraction for external storage. Implement this for custom backends.

```typescript
import type { StorageAdapter } from '@hua-labs/security/adapters';

const customAdapter: StorageAdapter = {
  get(key: string): Promise<string | null> { ... },
  set(key: string, value: string, ttlMs?: number): Promise<void> { ... },
  delete(key: string): Promise<void> { ... },
  increment(key: string, ttlMs?: number): Promise<number> { ... },
};
```

### Redis Adapter

DI pattern — zero Redis dependency in the package. You provide the client.

```typescript
import { createRedisAdapter } from '@hua-labs/security/adapters';
import type { RedisLikeClient } from '@hua-labs/security/adapters';

// Works with any Redis-compatible client
const adapter = createRedisAdapter({
  client: redisInstance,  // ioredis, @upstash/redis, node-redis
  keyPrefix: 'myapp:',   // default: 'hua:'
});
```

---

## App Integration Patterns

### my-app (Next.js App Router)

```typescript
// Server Components — use /server to prevent client leaks
import { encryptSmart, decryptSmart } from '@hua-labs/security/server';

// API Routes — use main import + presets
import { createStorageRateLimiter, RATE_LIMIT_PRESETS } from '@hua-labs/security';
import { createRedisAdapter } from '@hua-labs/security/adapters';

const adapter = createRedisAdapter({ client: redis });
const limiter = createStorageRateLimiter(adapter);

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const result = await limiter.checkRateLimit(userId, ip, RATE_LIMIT_PRESETS.diary);
  if (!result.allowed) {
    return Response.json({ error: 'Rate limited' }, { status: 429 });
  }
  // ...
}
```

### my-api (Node.js API Server)

```typescript
// No /server needed — import directly
import { createStorageRateLimiter, RATE_LIMIT_PRESETS, getClientIP } from '@hua-labs/security';
import { shouldSkipAnalysis } from '@hua-labs/security/pro';
```
