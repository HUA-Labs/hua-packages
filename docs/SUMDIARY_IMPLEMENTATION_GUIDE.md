# 숨다이어리 제한 시스템 구현 가이드

## 📋 개요

이 문서는 숨다이어리 제한 시스템의 실제 구현 방법을 단계별로 안내합니다.

## 🚀 구현 단계

### Phase 1: 기본 제한 시스템 (1주차)

#### 1.1 게스트 사용자 제한 구현

##### 클라이언트 사이드 훅
```typescript
// hooks/useGuestLimits.ts
import { useState, useEffect } from 'react';

interface GuestLimits {
  diaryWrite: number;
  emotionAnalysis: number;
  apiCalls: number;
}

const GUEST_LIMITS: GuestLimits = {
  diaryWrite: 1,
  emotionAnalysis: 1,
  apiCalls: 2
};

export const useGuestLimits = () => {
  const [limits, setLimits] = useState<GuestLimits>({
    diaryWrite: 0,
    emotionAnalysis: 0,
    apiCalls: 0
  });

  useEffect(() => {
    // localStorage에서 기존 사용량 로드
    const saved = localStorage.getItem('guest_usage');
    if (saved) {
      setLimits(JSON.parse(saved));
    }
  }, []);

  const canUse = (type: keyof GuestLimits) => {
    return limits[type] < GUEST_LIMITS[type];
  };

  const increment = (type: keyof GuestLimits) => {
    const newLimits = { ...limits, [type]: limits[type] + 1 };
    setLimits(newLimits);
    localStorage.setItem('guest_usage', JSON.stringify(newLimits));
  };

  const reset = () => {
    setLimits({ diaryWrite: 0, emotionAnalysis: 0, apiCalls: 0 });
    localStorage.removeItem('guest_usage');
  };

  return {
    limits,
    canUse,
    increment,
    reset,
    isLimitReached: Object.keys(GUEST_LIMITS).some(key => 
      limits[key as keyof GuestLimits] >= GUEST_LIMITS[key as keyof GuestLimits]
    )
  };
};
```

##### 게스트 제한 컴포넌트
```typescript
// components/GuestLimitPrompt.tsx
import React from 'react';
import { Button, Panel, Icon } from '@hua-labs/ui';
import { useGuestLimits } from '../hooks/useGuestLimits';

interface GuestLimitPromptProps {
  limitType: 'diaryWrite' | 'emotionAnalysis' | 'apiCalls';
  onLogin: () => void;
  onRegister: () => void;
}

export const GuestLimitPrompt: React.FC<GuestLimitPromptProps> = ({
  limitType,
  onLogin,
  onRegister
}) => {
  const { limits, canUse } = useGuestLimits();

  const messages = {
    diaryWrite: '더 많은 일기를 작성하려면 로그인하세요',
    emotionAnalysis: '감정 분석을 더 받으려면 로그인하세요',
    apiCalls: 'API 호출 한도를 늘리려면 로그인하세요'
  };

  const remaining = {
    diaryWrite: 1 - limits.diaryWrite,
    emotionAnalysis: 1 - limits.emotionAnalysis,
    apiCalls: 2 - limits.apiCalls
  };

  if (canUse(limitType)) {
    return null;
  }

  return (
    <Panel style="warning" padding="lg" className="mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <Icon name="alertCircle" className="h-5 w-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-amber-800">
          {messages[limitType]}
        </h3>
      </div>
      
      <p className="text-sm text-amber-700 mb-4">
        게스트 사용자는 {limitType === 'diaryWrite' ? '일기 작성' : 
        limitType === 'emotionAnalysis' ? '감정 분석' : 'API 호출'}을 
        {GUEST_LIMITS[limitType]}회까지만 사용할 수 있습니다.
        <br />
        남은 사용 가능 횟수: {remaining[limitType]}회
      </p>
      
      <div className="flex space-x-2">
        <Button onClick={onLogin} size="sm">
          <Icon name="logIn" className="h-4 w-4 mr-2" />
          로그인
        </Button>
        <Button variant="outline" onClick={onRegister} size="sm">
          <Icon name="userPlus" className="h-4 w-4 mr-2" />
          회원가입
        </Button>
      </div>
    </Panel>
  );
};
```

#### 1.2 일기 작성 제한 적용

##### 일기 에디터 수정
```typescript
// components/forms/diary-editor.tsx
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useGuestLimits } from '../../hooks/useGuestLimits';
import { GuestLimitPrompt } from '../GuestLimitPrompt';

export function DiaryEditor() {
  const { data: session } = useSession();
  const { canUse, increment, isLimitReached } = useGuestLimits();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 게스트 사용자 제한 확인
    if (!session && !canUse('diaryWrite')) {
      return;
    }

    try {
      // 일기 작성 로직
      await submitDiary({ title, content });
      
      // 게스트 사용자 사용량 증가
      if (!session) {
        increment('diaryWrite');
      }
      
      // 성공 처리
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('일기 작성 실패:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 게스트 제한 프롬프트 */}
      {!session && (
        <GuestLimitPrompt
          limitType="diaryWrite"
          onLogin={() => router.push('/auth/login')}
          onRegister={() => router.push('/auth/register')}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="diary-title">제목 (선택사항)</label>
          <input
            id="diary-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="오늘의 일기 제목을 입력하세요..."
            disabled={!session && !canUse('diaryWrite')}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label htmlFor="diary-content">일기 내용 *</label>
          <textarea
            id="diary-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘 하루는 어뭇셨나요? 마음을 자유롭게 표현해보세요..."
            disabled={!session && !canUse('diaryWrite')}
            className="w-full p-3 border rounded-lg h-40"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!session && !canUse('diaryWrite')}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg disabled:bg-gray-300"
        >
          {!session ? '일기 작성 (체험)' : '일기 저장'}
        </button>
      </form>
    </div>
  );
}
```

### Phase 2: 서버 사이드 제한 (2주차)

#### 2.1 레이트 리미팅 미들웨어

##### Redis 설정
```typescript
// lib/redis.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

export default redis;
```

##### 레이트 리미터 구현
```typescript
// lib/rateLimiter.ts
import redis from './redis';

interface RateLimitConfig {
  window: number;  // 초 단위
  maxRequests: number;
  keyPrefix: string;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - (this.config.window * 1000);

    // Lua 스크립트로 원자적 연산
    const luaScript = `
      local key = KEYS[1]
      local window = tonumber(ARGV[1])
      local limit = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      
      -- 오래된 엔트리 제거
      redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
      
      -- 현재 요청 수 확인
      local current = redis.call('ZCARD', key)
      
      if current < limit then
        -- 요청 추가
        redis.call('ZADD', key, now, now)
        redis.call('EXPIRE', key, window)
        return {1, limit - current - 1, now + window}
      else
        -- 제한 초과
        return {0, 0, redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')[2] + window}
      end
    `;

    const result = await redis.eval(
      luaScript,
      1,
      key,
      this.config.window * 1000,
      this.config.maxRequests,
      now
    ) as [number, number, number];

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      resetTime: result[2]
    };
  }
}

// 미리 정의된 레이트 리미터들
export const rateLimiters = {
  guest: new RateLimiter({
    window: 3600, // 1시간
    maxRequests: 5,
    keyPrefix: 'guest'
  }),
  user: new RateLimiter({
    window: 3600, // 1시간
    maxRequests: 100,
    keyPrefix: 'user'
  }),
  api: new RateLimiter({
    window: 3600, // 1시간
    maxRequests: 50,
    keyPrefix: 'api'
  })
};
```

##### Next.js API 미들웨어
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters } from './lib/rateLimiter';

export async function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  
  // IP 기반 레이트 리미팅
  const ipLimit = await rateLimiters.guest.checkLimit(ip);
  
  if (!ipLimit.allowed) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((ipLimit.resetTime - Date.now()) / 1000)
      }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((ipLimit.resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }

  // User-Agent 검사
  const suspiciousPatterns = [
    'python', 'curl', 'wget', 'postman', 'bot', 'crawler'
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  );

  if (isSuspicious) {
    return new NextResponse(
      JSON.stringify({ error: 'Suspicious user agent' }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};
```

#### 2.2 API 엔드포인트 보호

##### 일기 저장 API
```typescript
// app/api/diary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { rateLimiters } from '../../../lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const ip = request.ip || 'unknown';
    
    // 사용자별 레이트 리미팅
    const identifier = session?.user?.id || ip;
    const limiter = session ? rateLimiters.user : rateLimiters.guest;
    
    const limit = await limiter.checkLimit(identifier);
    
    if (!limit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((limit.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    // 게스트 사용자 추가 제한
    if (!session) {
      const guestUsage = await getGuestUsage(ip);
      if (guestUsage.diaryWrite >= 1) {
        return NextResponse.json(
          { error: 'Guest limit exceeded. Please login to continue.' },
          { status: 403 }
        );
      }
    }

    // 일기 저장 로직
    const { title, content } = await request.json();
    
    if (!session) {
      // 게스트 사용량 증가
      await incrementGuestUsage(ip, 'diaryWrite');
    }

    // 일기 저장 (암호화)
    const encryptedContent = encrypt(content);
    const diary = await saveDiary({
      title,
      content: encryptedContent,
      userId: session?.user?.id,
      isGuest: !session
    });

    return NextResponse.json({ 
      success: true, 
      diary,
      remaining: limit.remaining 
    });

  } catch (error) {
    console.error('일기 저장 오류:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Phase 3: 데이터 보호 (3주차)

#### 3.1 암호화 시스템

##### 암호화 유틸리티
```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export class EncryptionService {
  private key: Buffer;

  constructor() {
    // 환경변수에서 키 로드 또는 생성
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    this.key = Buffer.from(keyString, 'hex');
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, this.key);
    cipher.setAAD(Buffer.from('sumdiary', 'utf8'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // IV + Tag + Encrypted Data
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipher(ALGORITHM, this.key);
    decipher.setAAD(Buffer.from('sumdiary', 'utf8'));
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

export const encryptionService = new EncryptionService();
```

#### 3.2 익명화 시스템

##### 데이터 익명화
```typescript
// lib/anonymization.ts
import crypto from 'crypto';

export class AnonymizationService {
  // 개인 식별 정보 제거
  removePersonalInfo(data: any): any {
    const anonymized = { ...data };
    
    // 이메일 익명화
    if (anonymized.email) {
      anonymized.email = this.hashEmail(anonymized.email);
    }
    
    // IP 주소 익명화 (마지막 옥텟 제거)
    if (anonymized.ip) {
      anonymized.ip = this.anonymizeIP(anonymized.ip);
    }
    
    // User-Agent 익명화
    if (anonymized.userAgent) {
      anonymized.userAgent = this.anonymizeUserAgent(anonymized.userAgent);
    }
    
    return anonymized;
  }

  // 감정 분석 데이터 익명화
  anonymizeEmotionData(emotionData: any): any {
    return {
      emotion: emotionData.emotion,
      confidence: emotionData.confidence,
      timestamp: emotionData.timestamp,
      // 개인 식별 정보 제거
      userId: this.generateAnonymousId(emotionData.userId),
      sessionId: this.generateAnonymousId(emotionData.sessionId)
    };
  }

  // 이메일 해시화
  private hashEmail(email: string): string {
    return crypto.createHash('sha256').update(email).digest('hex').substring(0, 16);
  }

  // IP 주소 익명화
  private anonymizeIP(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0'; // 마지막 옥텟 제거
      return parts.join('.');
    }
    return ip;
  }

  // User-Agent 익명화
  private anonymizeUserAgent(ua: string): string {
    // 브라우저 타입만 유지
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  // 익명 ID 생성
  private generateAnonymousId(originalId: string): string {
    return crypto.createHash('sha256').update(originalId).digest('hex').substring(0, 8);
  }
}

export const anonymizationService = new AnonymizationService();
```

### Phase 4: 모니터링 및 최적화 (4주차)

#### 4.1 모니터링 대시보드

##### 실시간 지표 수집
```typescript
// lib/metrics.ts
import redis from './redis';

export class MetricsCollector {
  async recordRequest(type: 'diary_write' | 'emotion_analysis' | 'api_call', userId?: string) {
    const timestamp = Date.now();
    const key = `metrics:${type}:${new Date().toISOString().split('T')[0]}`;
    
    // 일일 카운터 증가
    await redis.incr(key);
    await redis.expire(key, 86400); // 24시간 후 만료
    
    // 사용자별 통계
    if (userId) {
      const userKey = `user_metrics:${userId}:${type}`;
      await redis.incr(userKey);
      await redis.expire(userKey, 86400);
    }
  }

  async recordBlock(reason: string, ip: string) {
    const key = `blocks:${reason}:${new Date().toISOString().split('T')[0]}`;
    await redis.incr(key);
    await redis.expire(key, 86400);
    
    // IP별 차단 기록
    const ipKey = `blocked_ips:${ip}`;
    await redis.sadd(ipKey, Date.now().toString());
    await redis.expire(ipKey, 86400);
  }

  async getDailyStats(date: string) {
    const types = ['diary_write', 'emotion_analysis', 'api_call'];
    const stats: any = {};
    
    for (const type of types) {
      const key = `metrics:${type}:${date}`;
      const count = await redis.get(key);
      stats[type] = parseInt(count || '0');
    }
    
    return stats;
  }
}

export const metricsCollector = new MetricsCollector();
```

#### 4.2 알림 시스템

##### 관리자 알림
```typescript
// lib/notifications.ts
export class NotificationService {
  async sendAbuseAlert(alert: {
    type: 'rate_limit' | 'suspicious_pattern' | 'mass_requests';
    severity: 'low' | 'medium' | 'high' | 'critical';
    data: any;
  }) {
    const message = this.formatAlertMessage(alert);
    
    // 이메일 알림
    if (alert.severity === 'high' || alert.severity === 'critical') {
      await this.sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `[숨다이어리] ${alert.type} 알림`,
        body: message
      });
    }
    
    // 슬랙 알림
    await this.sendSlack({
      channel: '#security-alerts',
      message: message,
      severity: alert.severity
    });
  }

  private formatAlertMessage(alert: any): string {
    const templates = {
      rate_limit: `레이트 리미트 초과 감지: ${alert.data.ip}`,
      suspicious_pattern: `의심스러운 패턴 감지: ${alert.data.pattern}`,
      mass_requests: `대량 요청 감지: ${alert.data.count}회`
    };
    
    return templates[alert.type] || '알 수 없는 알림';
  }

  private async sendEmail(data: { to: string; subject: string; body: string }) {
    // 이메일 전송 로직
  }

  private async sendSlack(data: { channel: string; message: string; severity: string }) {
    // 슬랙 전송 로직
  }
}

export const notificationService = new NotificationService();
```

## 🧪 테스트

### 1. 단위 테스트

```typescript
// __tests__/rateLimiter.test.ts
import { RateLimiter } from '../lib/rateLimiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      window: 60, // 1분
      maxRequests: 5,
      keyPrefix: 'test'
    });
  });

  it('should allow requests within limit', async () => {
    const result = await rateLimiter.checkLimit('test-user');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('should block requests exceeding limit', async () => {
    // 5회 요청
    for (let i = 0; i < 5; i++) {
      await rateLimiter.checkLimit('test-user');
    }
    
    // 6번째 요청은 차단
    const result = await rateLimiter.checkLimit('test-user');
    expect(result.allowed).toBe(false);
  });
});
```

### 2. 통합 테스트

```typescript
// __tests__/api/diary.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../app/api/diary/route';

describe('/api/diary', () => {
  it('should block guest users after limit', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { title: 'Test', content: 'Test content' }
    });

    // 첫 번째 요청은 성공
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);

    // 두 번째 요청은 차단
    await handler(req, res);
    expect(res._getStatusCode()).toBe(403);
  });
});
```

## 📊 성능 모니터링

### 1. 메트릭 수집

```typescript
// lib/performance.ts
export class PerformanceMonitor {
  async recordAPILatency(endpoint: string, latency: number) {
    const key = `latency:${endpoint}`;
    await redis.lpush(key, latency);
    await redis.ltrim(key, 0, 999); // 최근 1000개만 유지
    await redis.expire(key, 86400);
  }

  async getAverageLatency(endpoint: string): Promise<number> {
    const key = `latency:${endpoint}`;
    const latencies = await redis.lrange(key, 0, -1);
    const sum = latencies.reduce((acc, val) => acc + parseFloat(val), 0);
    return sum / latencies.length;
  }
}
```

### 2. 헬스 체크

```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      encryption: await checkEncryption()
    }
  };

  return NextResponse.json(health);
}
```

## 🚀 배포

### 1. 환경 변수 설정

```bash
# .env.production
REDIS_URL=redis://your-redis-url
ENCRYPTION_KEY=your-32-byte-hex-key
ADMIN_EMAIL=admin@sumdiary.com
SLACK_WEBHOOK_URL=your-slack-webhook
```

### 2. Docker 설정

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 3. 배포 스크립트

```bash
#!/bin/bash
# deploy.sh

# 빌드
npm run build

# 테스트
npm run test

# 배포
docker build -t sumdiary .
docker run -d -p 3000:3000 sumdiary

# 헬스 체크
curl -f http://localhost:3000/api/health || exit 1
```

---

## 📝 변경 이력

| 버전 | 날짜 | 변경사항 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2025-01-30 | 초기 구현 가이드 작성 | 리듬이 |

---

*이 문서는 숨다이어리 제한 시스템의 실제 구현을 위한 기술적 가이드입니다. 구현 과정에서 지속적으로 업데이트됩니다.*
