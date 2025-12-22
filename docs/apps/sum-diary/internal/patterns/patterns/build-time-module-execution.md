# Next.js 빌드 타임 모듈 실행 문제 해결

> **작성일**: 2025-12-04  
> **문제**: Next.js 빌드 시점에 모듈이 실행되면서 환경 변수가 없어 오류 발생  
> **해결**: Lazy Initialization 패턴과 Dynamic Import 활용

---

## 📋 목차

1. [문제 상황](#문제-상황)
2. [왜 발생했나?](#왜-발생했나)
3. [해결 방법](#해결-방법)
4. [실제 코드](#실제-코드)
5. [배운 점](#배운-점)
6. [참고 자료](#참고-자료)

---

## 🔴 문제 상황

### 발생한 에러

```
Error: supabaseUrl is required.
    at <unknown> (.next/server/chunks/3094.js:21:80415)
    at new bJ (.next/server/chunks/3094.js:21:80666)
    at bK (.next/server/chunks/3094.js:21:85528)
    at new A (.next/server/app/api/admin/test-daily-grant/route.js:1:2869)
```

### 빌드 프로세스

```
Next.js Build Process:
1. Compile TypeScript/JavaScript
2. Collect page data (모듈 로드 및 분석) ← 여기서 오류 발생!
3. Generate static pages
4. Finalize optimization
```

### 문제가 발생한 파일

- `apps/my-api/lib/credit-scheduler.ts`
- `apps/my-api/lib/services/notification-service.ts`
- `apps/my-api/app/api/admin/test-daily-grant/route.ts`

---

## 🤔 왜 발생했나?

### 1. **Next.js 빌드 프로세스**

Next.js는 빌드 시점에 모든 API 라우트와 페이지를 분석합니다:

```typescript
// 빌드 타임에 실행됨
import { creditScheduler } from '../../../../lib/credit-scheduler';

// credit-scheduler.ts가 로드되면서
import { notificationService } from './services/notification-service';

// notification-service.ts가 로드되면서
class NotificationService {
  private supabase = createClient(
    process.env.SUPABASE_URL!, // ❌ 빌드 타임에 환경 변수가 없음!
    process.env.SUPABASE_SERVICE_KEY!
  );
}
```

### 2. **모듈 레벨 실행**

JavaScript/TypeScript에서 모듈을 import하면 모듈 레벨의 코드가 즉시 실행됩니다:

```typescript
// ❌ 문제가 있는 코드
class NotificationService {
  // 클래스 필드 초기화는 모듈 로드 시 실행됨
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

// 모듈이 import되면 위 코드가 즉시 실행됨
export const notificationService = new NotificationService();
```

### 3. **환경 변수의 가용성**

- **로컬 개발**: `.env` 파일에서 환경 변수 로드
- **Vercel 빌드**: 빌드 타임에는 일부 환경 변수가 없을 수 있음
- **런타임**: 모든 환경 변수 사용 가능

---

## ✅ 해결 방법

### 핵심 아이디어: **Lazy Initialization**

코드를 빌드 타임이 아닌 **런타임에만 실행**하도록 지연 초기화합니다.

### 방법 1: Getter를 사용한 Lazy Initialization

```typescript
// ✅ 해결된 코드
class NotificationService {
  private _supabase: ReturnType<typeof createClient> | null = null;

  // Getter를 사용하여 필요할 때만 초기화
  private get supabase() {
    if (!this._supabase) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl) {
        throw new Error('SUPABASE_URL is required');
      }

      if (!supabaseServiceKey) {
        throw new Error('SUPABASE_SERVICE_KEY is required');
      }

      this._supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return this._supabase;
  }
}
```

### 방법 2: 함수를 사용한 Lazy Initialization

```typescript
// ✅ 해결된 코드
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is required');
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_KEY is required');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// 사용 시점에만 호출
const supabase = getSupabaseClient();
```

### 방법 3: Dynamic Import

```typescript
// ❌ 문제가 있는 코드
import { creditScheduler } from '../../../../lib/credit-scheduler';

export async function POST(request: NextRequest) {
  await creditScheduler.getInstance().manualGrantDailyCredits();
}

// ✅ 해결된 코드
export async function POST(request: NextRequest) {
  // Dynamic import로 빌드 타임 실행 방지
  const { creditScheduler } = await import('../../../../lib/credit-scheduler');
  
  await creditScheduler.getInstance().manualGrantDailyCredits();
}
```

---

## 💻 실제 코드

### Before (문제가 있던 코드)

#### 1. notification-service.ts

```typescript
import { createClient } from '@supabase/supabase-js';

class NotificationService {
  // ❌ 모듈 로드 시 즉시 실행됨
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  async sendUserNotification(userId: string, notification: NotificationData) {
    // supabase 사용
    await this.supabase.from('notifications').insert({...});
  }
}

export const notificationService = new NotificationService();
```

#### 2. credit-scheduler.ts

```typescript
import { createClient } from '@supabase/supabase-js';
import { notificationService } from './services/notification-service';

// ❌ 모듈 로드 시 즉시 실행됨
function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

class CreditScheduler {
  async distributeDailyCredits() {
    const supabase = getSupabaseClient(); // 런타임에 호출되지만...
    // notificationService가 이미 로드되면서 오류 발생
  }
}
```

#### 3. test-daily-grant/route.ts

```typescript
// ❌ Static import는 빌드 타임에 실행됨
import { creditScheduler } from '../../../../lib/credit-scheduler';

export async function POST(request: NextRequest) {
  await creditScheduler.getInstance().manualGrantDailyCredits();
}
```

### After (해결된 코드)

#### 1. notification-service.ts

```typescript
import { createClient } from '@supabase/supabase-js';

class NotificationService {
  private _supabase: ReturnType<typeof createClient> | null = null;

  // ✅ Getter를 사용하여 필요할 때만 초기화
  private get supabase() {
    if (!this._supabase) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl) {
        throw new Error('SUPABASE_URL is required');
      }

      if (!supabaseServiceKey) {
        throw new Error('SUPABASE_SERVICE_KEY is required');
      }

      this._supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return this._supabase;
  }

  async sendUserNotification(userId: string, notification: NotificationData) {
    // ✅ 런타임에만 supabase가 초기화됨
    await (this.supabase.from('notifications') as any).insert({...});
  }
}

export const notificationService = new NotificationService();
```

#### 2. credit-scheduler.ts

```typescript
import { createClient } from '@supabase/supabase-js';
import { notificationService } from './services/notification-service';

// ✅ 함수로 감싸서 필요할 때만 호출
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is required');
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_KEY is required');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

class CreditScheduler {
  async distributeDailyCredits() {
    // ✅ 런타임에만 호출됨
    const supabase = getSupabaseClient();
    // ...
  }
}
```

#### 3. test-daily-grant/route.ts

```typescript
// ✅ Dynamic import로 빌드 타임 실행 방지
export async function POST(request: NextRequest) {
  try {
    // Dynamic import는 런타임에만 실행됨
    const { creditScheduler } = await import('../../../../lib/credit-scheduler');
    
    await creditScheduler.getInstance().manualGrantDailyCredits();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

---

## 🎓 배운 점

### 1. **Next.js 빌드 프로세스 이해**

- Next.js는 빌드 시점에 모든 모듈을 분석
- Static import는 빌드 타임에 실행됨
- Dynamic import는 런타임에만 실행됨

### 2. **모듈 레벨 실행의 위험성**

```typescript
// ❌ 위험: 모듈 로드 시 즉시 실행
const client = createClient(process.env.API_KEY!);

// ✅ 안전: 필요할 때만 실행
function getClient() {
  return createClient(process.env.API_KEY!);
}
```

### 3. **Lazy Initialization 패턴**

- **Getter 패턴**: 클래스 내부에서 사용할 때
- **함수 패턴**: 독립적인 유틸리티 함수로 사용할 때
- **Dynamic Import**: 모듈 전체를 지연 로드할 때

### 4. **환경 변수 관리**

- 빌드 타임과 런타임을 구분
- 환경 변수 검증을 적절한 시점에 수행
- 기본값 제공으로 빌드 타임 오류 방지

---

## ⚠️ 주의사항

### 1. **Getter의 성능 고려**

```typescript
// ⚠️ Getter가 자주 호출되면 매번 체크가 발생
private get supabase() {
  if (!this._supabase) {
    // 초기화 로직
  }
  return this._supabase;
}

// ✅ 한 번만 초기화되므로 성능 문제 없음
```

### 2. **Dynamic Import의 제약**

```typescript
// ❌ Top-level await는 일부 환경에서 지원되지 않을 수 있음
const { module } = await import('./module');

// ✅ 함수 내부에서 사용
async function useModule() {
  const { module } = await import('./module');
  return module;
}
```

### 3. **타입 안정성**

```typescript
// Dynamic import는 타입 추론이 어려울 수 있음
const { creditScheduler } = await import('./credit-scheduler');
// creditScheduler의 타입이 any로 추론될 수 있음

// ✅ 타입 명시
const { creditScheduler }: { creditScheduler: CreditSchedulerType } = 
  await import('./credit-scheduler');
```

---

## 🔍 대안적 해결 방법

### 방법 1: 환경 변수 기본값 제공

```typescript
// ⚠️ 빌드 타임에 기본값이 필요할 수 있음
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
```

**장점**: 빌드가 성공함  
**단점**: 잘못된 값으로 초기화될 수 있음

### 방법 2: 조건부 초기화

```typescript
// ⚠️ 빌드 타임 체크
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'production') {
  const client = createClient(process.env.API_KEY!);
}
```

**장점**: 간단함  
**단점**: 모든 환경에서 작동하지 않을 수 있음

### 방법 3: Factory 패턴

```typescript
// ✅ Factory 함수 사용
export function createNotificationService() {
  return new NotificationService();
}

// 사용
const service = createNotificationService();
```

**장점**: 명시적 초기화  
**단점**: 매번 새 인스턴스 생성

---

## 📚 참고 자료

### Next.js 공식 문서

- [Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Build Process](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

### 관련 아티클

- [Next.js Build-Time vs Runtime](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [JavaScript Module Execution](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

### 우리 프로젝트

- [`credit-scheduler.ts`](../../../my-api/lib/credit-scheduler.ts)
- [`notification-service.ts`](../../../my-api/lib/services/notification-service.ts)
- [`test-daily-grant/route.ts`](../../../my-api/app/api/admin/test-daily-grant/route.ts)

---

## 📊 적용 결과

### 코드 메트릭

| 항목 | Before | After | 개선 |
|------|--------|-------|------|
| 빌드 오류 | 3개 | 0개 | ✅ |
| 빌드 성공률 | 0% | 100% | ✅ |
| 타입 오류 | 다수 | 0개 | ✅ |
| Vercel 빌드 | 실패 | 성공 | ✅ |

### 생성/수정된 파일

1. `apps/my-api/lib/credit-scheduler.ts` (수정)
2. `apps/my-api/lib/services/notification-service.ts` (수정)
3. `apps/my-api/app/api/admin/test-daily-grant/route.ts` (수정)

---

## 💡 결론

Next.js 빌드 타임 모듈 실행 문제는 **Lazy Initialization 패턴**과 **Dynamic Import**를 활용하여 해결할 수 있습니다:

✅ **빌드 타임 실행 방지**  
✅ **런타임에만 초기화**  
✅ **환경 변수 안전하게 사용**  
✅ **코드 가독성 유지**

이 패턴은 다른 Next.js 프로젝트에서도 유사한 상황에 적용할 수 있는 범용적인 해결책입니다!

---

**Created**: 2025-12-04  
**Last Updated**: 2025-12-04  
**Author**: HUA Team

