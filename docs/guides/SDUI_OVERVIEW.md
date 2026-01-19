# SDUI (Server-Driven UI) 개요

> **상태: 개발 중**
> 이 문서는 SDUI의 컨셉과 예상 사용 방식을 설명합니다.
> 실제 구현은 변경될 수 있습니다.

## SDUI란?

**Server-Driven UI**는 UI의 구조와 데이터를 서버에서 정의하고, 클라이언트는 이를 렌더링만 하는 패턴입니다.

```
기존 방식:
  클라이언트가 UI 구조 결정 → 서버에서 데이터만 받음

SDUI 방식:
  서버가 UI 구조 + 데이터 함께 전달 → 클라이언트는 렌더링만
```

### 왜 SDUI인가?

| 기존 방식 | SDUI |
|-----------|------|
| UI 변경 = 앱 배포 필요 | UI 변경 = 서버만 수정 |
| 플랫폼별 UI 코드 중복 | 하나의 스펙으로 모든 플랫폼 |
| 개발자만 UI 수정 가능 | 비개발자도 CMS로 수정 가능 |
| A/B 테스트 복잡 | 서버에서 분기 처리 |

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      HUA Cloud (예정)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ SDUI Editor │  │ Component   │  │ API Gateway         │  │
│  │ (비주얼)    │  │ Registry    │  │ /api/sdui/*         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ JSON Spec
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     사용자 애플리케이션                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  <SDUIRenderer endpoint="/api/sdui/landing" />      │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  HUA UI Components (Button, Card, etc.)             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 배포 방식 (HUA Labs 제공)

### Option 1: HUA Cloud (SaaS)

```
사용자 → HUA Cloud 대시보드에서 UI 편집 → API 엔드포인트 제공
```

- HUA Labs가 호스팅
- 월 구독 모델
- 비주얼 에디터 제공
- 별도 서버 구축 불필요

### Option 2: Self-Hosted

```bash
# Docker로 SDUI 서버 직접 운영
docker run -d hua-labs/sdui-server
```

- 자체 인프라에 배포
- 데이터 완전 통제
- 엔터프라이즈/보안 요구사항 대응

### Option 3: Hybrid

```
정적 페이지 → Self-Hosted
동적 페이지 → HUA Cloud API
```

---

## 사용자 관점: 설치 및 사용

### Step 1: 패키지 설치

```bash
pnpm add @hua-labs/sdui-renderer
```

### Step 2: 렌더러 추가

```tsx
// app/landing/page.tsx
import { SDUIRenderer } from '@hua-labs/sdui-renderer';

export default function LandingPage() {
  return (
    <SDUIRenderer
      endpoint="https://api.hua-labs.com/sdui/my-project/landing"
      fallback={<LoadingSkeleton />}
    />
  );
}
```

### Step 3: 끝!

서버에서 내려온 스펙대로 UI가 렌더링됩니다.

---

## SDUI 스펙 구조 (예시)

서버에서 내려오는 JSON 스펙:

```json
{
  "version": "1.0",
  "page": "landing",
  "components": [
    {
      "type": "Hero",
      "props": {
        "title": "숨 다이어리",
        "subtitle": "그냥 내 이야기를 들어줄래?",
        "cta": {
          "text": "시작하기",
          "href": "/auth/login"
        }
      },
      "motion": {
        "type": "fadeIn",
        "duration": 500
      }
    },
    {
      "type": "FeatureGrid",
      "props": {
        "columns": 3,
        "items": [
          {
            "icon": "pencil",
            "title": "일기 작성",
            "description": "자유롭게 기록하세요"
          },
          {
            "icon": "sparkle",
            "title": "AI 분석",
            "description": "감정을 이해해드려요"
          },
          {
            "icon": "chart",
            "title": "감정 추적",
            "description": "시간에 따른 변화를 확인하세요"
          }
        ]
      },
      "motion": {
        "type": "staggerSlideUp",
        "delay": 100
      }
    },
    {
      "type": "CTA",
      "props": {
        "title": "지금 시작하세요",
        "buttons": [
          { "text": "무료로 시작", "variant": "primary", "href": "/auth/register" },
          { "text": "더 알아보기", "variant": "secondary", "href": "/about" }
        ]
      }
    }
  ],
  "meta": {
    "title": "숨 다이어리 - 감정 일기장",
    "description": "AI가 함께하는 감정 일기장"
  }
}
```

---

## 컴포넌트 레지스트리

사용 가능한 컴포넌트 목록 (HUA UI 기반):

### 레이아웃
- `Container` - 컨테이너
- `Section` - 섹션
- `Grid` - 그리드 레이아웃
- `Stack` - 수직/수평 스택
- `Divider` - 구분선

### 히어로/랜딩
- `Hero` - 히어로 섹션
- `FeatureGrid` - 기능 그리드
- `FeatureList` - 기능 리스트
- `CTA` - Call to Action
- `Testimonial` - 후기/추천사
- `Pricing` - 가격표
- `FAQ` - 자주 묻는 질문

### 기본 UI
- `Text` - 텍스트
- `Heading` - 제목
- `Button` - 버튼
- `Image` - 이미지
- `Icon` - 아이콘
- `Card` - 카드
- `Badge` - 뱃지

### 인터랙티브
- `Accordion` - 아코디언
- `Tabs` - 탭
- `Modal` - 모달 (트리거 포함)
- `Carousel` - 캐러셀

### 폼 (제한적)
- `ContactForm` - 문의 폼 (사전 정의)
- `NewsletterForm` - 뉴스레터 구독

---

## 모션 지원

스펙에 `motion` 필드 추가로 애니메이션 적용:

```json
{
  "type": "Card",
  "props": { ... },
  "motion": {
    "type": "fadeIn",        // fadeIn, slideUp, slideLeft, scaleIn, bounceIn
    "duration": 500,         // ms
    "delay": 100,            // ms
    "trigger": "inView"      // inView, onLoad, onHover
  }
}
```

### 지원 모션 타입

| 타입 | 설명 |
|------|------|
| `fadeIn` | 페이드 인 |
| `slideUp` | 아래에서 위로 |
| `slideDown` | 위에서 아래로 |
| `slideLeft` | 오른쪽에서 왼쪽으로 |
| `slideRight` | 왼쪽에서 오른쪽으로 |
| `scaleIn` | 확대되며 나타남 |
| `bounceIn` | 바운스 효과 |
| `staggerSlideUp` | 자식 요소 순차 등장 |

---

## 다국어 (i18n) 지원

스펙에서 번역 키 사용:

```json
{
  "type": "Hero",
  "props": {
    "title": "{{t:landing.hero.title}}",
    "subtitle": "{{t:landing.hero.subtitle}}"
  }
}
```

렌더러가 자동으로 현재 언어에 맞는 번역 적용.

---

## 레거시 프로젝트에 삽입

기존 앱 어디든 SDUI 영역 삽입 가능:

```tsx
// 기존 React 앱
function App() {
  return (
    <div>
      <LegacyHeader />

      {/* 이 부분만 SDUI */}
      <SDUIRenderer endpoint="/api/sdui/promo-banner" />

      <LegacyContent />

      {/* 푸터도 SDUI로 관리 */}
      <SDUIRenderer endpoint="/api/sdui/footer" />
    </div>
  );
}
```

---

## 이벤트 핸들링

### 기본 액션

```json
{
  "type": "Button",
  "props": {
    "text": "제출하기"
  },
  "action": {
    "type": "navigate",
    "href": "/success"
  }
}
```

### 지원 액션 타입

| 액션 | 설명 |
|------|------|
| `navigate` | 페이지 이동 |
| `openModal` | 모달 열기 |
| `closeModal` | 모달 닫기 |
| `scrollTo` | 특정 섹션으로 스크롤 |
| `externalLink` | 외부 링크 (새 탭) |
| `trackEvent` | 애널리틱스 이벤트 |
| `custom` | 커스텀 핸들러 호출 |

### 커스텀 핸들러

```tsx
<SDUIRenderer
  endpoint="/api/sdui/page"
  handlers={{
    onSubmitForm: async (data) => {
      await submitToAPI(data);
    },
    onCustomAction: (payload) => {
      console.log('Custom action:', payload);
    }
  }}
/>
```

---

## 캐싱 및 성능

### 클라이언트 캐싱

```tsx
<SDUIRenderer
  endpoint="/api/sdui/landing"
  cache={{
    strategy: 'stale-while-revalidate',
    ttl: 60000  // 1분
  }}
/>
```

### 정적 생성 (SSG)

```tsx
// Next.js에서 빌드 타임에 스펙 가져오기
export async function generateStaticParams() {
  const spec = await fetchSDUISpec('/api/sdui/landing');
  return { spec };
}

export default function Page({ spec }) {
  return <SDUIRenderer spec={spec} />;
}
```

---

## 보안

### 허용된 컴포넌트만 렌더링

```tsx
<SDUIRenderer
  endpoint="/api/sdui/page"
  allowedComponents={['Hero', 'Card', 'Button', 'Text']}
/>
```

### XSS 방지
- 모든 텍스트 자동 이스케이프
- `dangerouslySetInnerHTML` 사용 불가
- 스크립트 삽입 차단

---

## 인프라 및 호스팅

### 호스팅 옵션 비교

| 서비스 | 비용 | 장점 | 단점 | 추천 상황 |
|--------|------|------|------|----------|
| **Vercel** | 무료~$20/월 | Next.js 친화적, 익숙함 | Edge 제약 | 이미 Vercel 사용 중 |
| **Railway** | $5~/월 | 쉬움, Docker 지원 | 스케일 한계 | 빠른 시작 |
| **Fly.io** | $5~/월 | 글로벌 엣지, 빠름 | 설정 복잡 | 글로벌 서비스 |
| **Cloudflare Workers** | 무료~$5/월 | 매우 빠름, 저렴 | 런타임 제약 | 단순 API |
| **AWS Lambda** | 종량제 | 무제한 스케일 | 복잡함 | 엔터프라이즈 |
| **Supabase Edge Functions** | 무료~$25/월 | DB 통합 | 제약 있음 | Supabase 사용 중 |

### 단계별 인프라 전략 (권장)

```
Phase 1: MVP (비용 $0)
┌─────────────────────────────────────┐
│  /public/sdui/*.json (정적 파일)    │
│  GitHub에 스펙 저장                 │
│  앱에서 직접 import 또는 fetch      │
└─────────────────────────────────────┘
  - SDUI 개발/검증 단계
  - 사용자 없음
  - 빠른 이터레이션

Phase 2: 초기 서비스 (비용 ~$20/월)
┌─────────────────────────────────────┐
│  Vercel/Railway에 sdui-api 배포     │
│  Supabase에 스펙 JSON 저장          │
│  간단한 어드민 페이지               │
└─────────────────────────────────────┘
  - 초기 사용자 대응
  - 동적 스펙 관리 필요
  - 버전 관리 시작

Phase 3: 스케일 (비용 $100~/월)
┌─────────────────────────────────────┐
│  전용 SDUI 서버 (Fly.io/AWS)        │
│  Redis 캐싱                         │
│  CDN 연동                           │
│  비주얼 에디터                      │
└─────────────────────────────────────┘
  - 다수 사용자
  - 실시간 편집 필요
  - SLA 요구사항
```

### 아키텍처 예시: Vercel + Supabase

```
┌─────────────────┐     ┌─────────────────┐
│  SDUI Admin     │────▶│   Supabase      │
│  (Next.js)      │     │   - specs 테이블│
└─────────────────┘     │   - versions    │
        │               │   - analytics   │
        │               └────────┬────────┘
        ▼                        │
┌─────────────────┐              │
│  Vercel Edge    │◀─────────────┘
│  /api/sdui/*    │
└────────┬────────┘
         │ JSON Spec
         ▼
┌─────────────────┐
│  Client Apps    │
│  my-app      │
│  hua-docs       │
└─────────────────┘
```

### 데이터베이스 스키마 (Supabase 예시)

```sql
-- SDUI 스펙 저장
create table sdui_specs (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,        -- 'my-app', 'hua-docs'
  page_id text not null,           -- 'landing', 'about'
  spec jsonb not null,             -- SDUI JSON 스펙
  version int default 1,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(project_id, page_id, version)
);

-- 버전 히스토리
create table sdui_versions (
  id uuid primary key default gen_random_uuid(),
  spec_id uuid references sdui_specs(id),
  spec jsonb not null,
  created_by text,
  created_at timestamptz default now()
);
```

### 캐싱 전략

```typescript
// Edge에서 캐싱 (Vercel/Cloudflare)
export async function GET(request: Request) {
  const spec = await getSpec(pageId);

  return new Response(JSON.stringify(spec), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
```

### 비용 추정 (월 기준)

| 규모 | 요청 수 | Vercel | Railway | AWS |
|------|---------|--------|---------|-----|
| 개인/MVP | ~10K | 무료 | 무료 | ~$1 |
| 소규모 | ~100K | $20 | $5 | ~$5 |
| 중규모 | ~1M | $20 | $20 | ~$20 |
| 대규모 | ~10M | 별도문의 | $100+ | ~$100 |

---

## 기술적 고도화 계획

### 타입 안정성 (Type Safety)

JSON 스펙은 유연하지만 런타임 에러의 원인이 될 수 있음.

**Zod 스키마 검증:**
```typescript
import { z } from 'zod';

const ComponentSchema = z.object({
  type: z.string(),
  props: z.record(z.unknown()),
  motion: z.object({
    type: z.enum(['fadeIn', 'slideUp', 'scaleIn']),
    duration: z.number().optional(),
  }).optional(),
  children: z.array(z.lazy(() => ComponentSchema)).optional(),
});

const SDUISpecSchema = z.object({
  version: z.string(),
  page: z.string(),
  components: z.array(ComponentSchema),
});

// 렌더러에서 검증
function validateSpec(spec: unknown) {
  return SDUISpecSchema.parse(spec);
}
```

**Schema Registry:**
- 컴포넌트 타입과 props 구조를 JSON Schema로 정의
- 에디터와 클라이언트가 동일한 스키마 공유
- 잘못된 스펙 조기 발견 가능

---

### 컴포넌트 간 상태 관리 (Inter-component State)

단순 렌더링을 넘어 컴포넌트 간 상호작용 지원.

**예시 시나리오:**
- Button 클릭 → 같은 페이지 Accordion 열림
- Input 값 변경 → 다른 컴포넌트에 반영

**localState 필드 제안:**
```json
{
  "type": "Section",
  "localState": {
    "isExpanded": false
  },
  "children": [
    {
      "type": "Button",
      "props": { "text": "펼치기" },
      "action": {
        "type": "updateState",
        "key": "isExpanded",
        "value": true
      }
    },
    {
      "type": "Accordion",
      "props": {
        "open": "{{state.isExpanded}}"
      }
    }
  ]
}
```

---

### 동적 데이터 바인딩 (Dynamic Data Binding)

사용자 데이터와 스펙을 결합하여 개인화된 UI 제공.

**플레이스홀더 문법:**
```json
{
  "type": "Hero",
  "props": {
    "title": "{{user.nickname}}님, 안녕하세요!",
    "subtitle": "오늘의 감정 점수: {{data.emotionScore}}점"
  }
}
```

**렌더러에서 데이터 주입:**
```tsx
<SDUIRenderer
  endpoint="/api/sdui/dashboard"
  context={{
    user: { nickname: "민수" },
    data: { emotionScore: 85 }
  }}
/>
```

**지원 바인딩 타입:**
| 문법 | 설명 |
|------|------|
| `{{t:key}}` | 번역 키 |
| `{{user.field}}` | 사용자 정보 |
| `{{data.field}}` | 주입된 데이터 |
| `{{state.key}}` | 로컬 상태 |
| `{{env.VAR}}` | 환경 변수 (제한적) |

---

### A/B 테스트 지원

**확장된 DB 스키마:**
```sql
alter table sdui_specs
add column weight int default 100,        -- 노출 비중 (0-100)
add column experiment_group text,         -- 실험군 구분 ('control', 'variant_a', 'variant_b')
add column target_segment jsonb;          -- 타겟 조건 (예: {"country": "KR", "plan": "premium"})
```

**가중치 기반 스펙 선택:**
```typescript
async function getSpecWithABTest(projectId: string, pageId: string, userContext: UserContext) {
  const specs = await supabase
    .from('sdui_specs')
    .select('*')
    .eq('project_id', projectId)
    .eq('page_id', pageId)
    .eq('is_published', true);

  // 가중치 기반 랜덤 선택
  const selected = weightedRandom(specs, 'weight');

  // 애널리틱스 기록
  await trackExperiment(selected.experiment_group, userContext);

  return selected.spec;
}
```

---

### 에러 핸들링 및 폴백 (Error Handling & Fallback)

프로덕션에서 가장 중요한 부분. SDUI 서버가 죽으면 전체 페이지가 날아감.

**폴백 전략:**
```tsx
<SDUIRenderer
  endpoint="/api/sdui/landing"
  fallback={<LandingPageFallback />}  // 정적 폴백 컴포넌트
  errorBoundary={true}
  timeout={5000}  // 5초 타임아웃
  retryCount={2}  // 2회 재시도
/>
```

**캐시된 스펙 사용:**
```typescript
// 마지막 성공한 스펙을 로컬에 캐시
const cachedSpec = localStorage.getItem(`sdui:${pageId}`);

async function fetchSpecWithFallback(endpoint: string) {
  try {
    const spec = await fetchSpec(endpoint);
    localStorage.setItem(`sdui:${pageId}`, JSON.stringify(spec));
    return spec;
  } catch (error) {
    console.warn('[SDUI] Fetch failed, using cached spec');
    return cachedSpec ? JSON.parse(cachedSpec) : null;
  }
}
```

**에러 리포팅:**
```typescript
// Sentry 등과 연동
onError={(error, specId) => {
  Sentry.captureException(error, {
    tags: { sdui_page: specId },
    extra: { spec: currentSpec }
  });
}}
```

---

### 성능 최적화 (Performance)

**컴포넌트 지연 로딩:**
```typescript
// 무거운 컴포넌트는 dynamic import
const componentRegistry = {
  Button: Button,  // 즉시 로드
  Card: Card,
  // 무거운 컴포넌트는 lazy
  Chart: lazy(() => import('@hua-labs/ui/Chart')),
  DataTable: lazy(() => import('@hua-labs/ui/DataTable')),
};
```

**스켈레톤 자동 생성:**
```json
{
  "type": "Card",
  "props": { ... },
  "skeleton": {
    "enabled": true,
    "lines": 3
  }
}
```

**Above-the-fold 우선 렌더링:**
```json
{
  "components": [
    { "type": "Hero", "priority": "high" },      // 즉시 렌더
    { "type": "Features", "priority": "low" },   // Intersection Observer로 지연
  ]
}
```

---

### 버전 관리 전략 (Versioning)

스펙 포맷이 바뀌면 기존 저장된 스펙이 깨질 수 있음.

**스펙 버전 명시:**
```json
{
  "specVersion": "1.0",  // 스펙 포맷 버전
  "version": 3,          // 콘텐츠 버전
  "components": [...]
}
```

**렌더러에서 버전 체크:**
```typescript
const SUPPORTED_SPEC_VERSIONS = ['1.0', '1.1'];

function renderSpec(spec: SDUISpec) {
  if (!SUPPORTED_SPEC_VERSIONS.includes(spec.specVersion)) {
    console.error(`[SDUI] Unsupported spec version: ${spec.specVersion}`);
    return <FallbackUI />;
  }
  // ...
}
```

**마이그레이션 함수:**
```typescript
// 구버전 스펙을 신버전으로 변환
const migrators = {
  '0.9': (spec) => ({ ...spec, specVersion: '1.0', /* 변환 로직 */ }),
  '1.0': (spec) => spec,  // 현재 버전
};
```

---

### 관측성 (Observability)

SDUI가 잘 동작하는지 모니터링 필수.

**수집할 메트릭:**
```typescript
interface SDUIMetrics {
  // 성능
  fetchDuration: number;      // 스펙 로딩 시간
  renderDuration: number;     // 렌더링 시간
  totalComponents: number;    // 컴포넌트 수

  // 에러
  fetchErrors: number;
  renderErrors: number;
  validationErrors: number;

  // 사용량
  cacheHitRate: number;
  uniquePages: string[];
}
```

**대시보드 필수 항목:**
- 페이지별 로딩 시간 (p50, p95, p99)
- 에러율 추이
- 가장 많이 사용되는 컴포넌트
- A/B 테스트 결과

---

### 오프라인 지원 (PWA)

숨다이어리처럼 PWA가 중요한 서비스는 오프라인 고려 필요.

**Service Worker 캐싱:**
```javascript
// sw.js
const SDUI_CACHE = 'sdui-specs-v1';

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/sdui/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetched = fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(SDUI_CACHE).then((cache) => cache.put(event.request, clone));
          return response;
        });
        return cached || fetched;
      })
    );
  }
});
```

**오프라인 우선 전략:**
```
1. 캐시된 스펙으로 즉시 렌더링
2. 백그라운드에서 새 스펙 fetch
3. 변경 있으면 UI 업데이트 (또는 다음 방문 시 적용)
```

---

### 점진적 마이그레이션 (Migration Path)

기존 페이지를 한 번에 SDUI로 바꾸지 말 것.

**권장 마이그레이션 순서:**
```
1단계: 정적 콘텐츠 (공지사항, 이벤트 배너)
   - 리스크 낮음
   - 변경 빈도 높음
   - 효과 즉시 체감

2단계: 랜딩/마케팅 페이지
   - A/B 테스트 효과 큼
   - 비개발자 수정 가능

3단계: 설정/프로필 등 2차 페이지
   - 변경 빈도 중간

4단계: 핵심 기능 (신중히)
   - 일기 작성, 분석 결과 등
   - 충분히 검증 후 적용
```

**하이브리드 렌더링:**
```tsx
// 같은 페이지에서 일부만 SDUI
function DiaryPage() {
  return (
    <>
      <Header />  {/* 기존 코드 */}

      {/* 이벤트 배너만 SDUI */}
      <SDUIRenderer endpoint="/api/sdui/diary-banner" />

      <DiaryContent />  {/* 기존 코드 */}
      <Footer />  {/* 기존 코드 */}
    </>
  );
}
```

---

### 컴포넌트 조합 규칙 (Composition Rules)

아무거나 중첩하면 안 됨. 규칙 필요.

**허용/금지 매트릭스:**
```typescript
const compositionRules = {
  Hero: {
    allowedChildren: ['Button', 'Badge', 'Text'],
    maxChildren: 3,
  },
  Card: {
    allowedChildren: ['Text', 'Image', 'Button', 'Badge'],
    maxChildren: 10,
  },
  Grid: {
    allowedChildren: ['Card', 'Image', 'Text'],
    maxChildren: 12,
  },
  // Modal 안에 Modal 금지
  Modal: {
    allowedChildren: ['Text', 'Button', 'Form'],
    disallowedChildren: ['Modal'],
  },
};
```

**스펙 검증 시 체크:**
```typescript
function validateComposition(component: Component, parent?: Component) {
  if (parent) {
    const rules = compositionRules[parent.type];
    if (rules?.disallowedChildren?.includes(component.type)) {
      throw new Error(`${component.type} cannot be nested inside ${parent.type}`);
    }
  }
}
```

---

## CTO 추가 의견

> 아래는 SDUI 도입 시 현실적으로 고려해야 할 점들.

### SDUI가 적합하지 않은 경우

솔직히 말하면 SDUI가 만능은 아님:

| 상황 | 왜 SDUI가 안 맞나 |
|------|------------------|
| 복잡한 폼 (다단계 validation) | 상태 관리가 너무 복잡해짐 |
| 실시간 협업 기능 | WebSocket + 로컬 상태가 핵심 |
| 게임/캔버스 기반 UI | 컴포넌트 추상화가 맞지 않음 |
| 초기 스타트업 MVP | 오버엔지니어링, 그냥 코드 짜는 게 빠름 |
| 1인 개발 | 에디터 만들 시간에 직접 코딩이 나음 |

**원칙:** 변경 빈도가 낮고 복잡도가 높으면 → 그냥 코드로.

---

### 디버깅의 현실

SDUI 도입하면 디버깅이 한 단계 어려워짐:

```
기존: 컴포넌트 코드 → 브라우저
SDUI: JSON 스펙 → 파서 → 렌더러 → 컴포넌트 → 브라우저
```

**필수 도구:**
- JSON 스펙 뷰어 (어떤 스펙이 내려왔는지)
- 렌더 트리 시각화 (어떻게 해석됐는지)
- 타임라인 로깅 (언제 뭐가 바뀌었는지)

이거 없으면 "왜 이렇게 렌더링되지?" 할 때 답이 없음.

---

### 테스트 전략

SDUI는 테스트 레이어가 늘어남:

```
1. 스펙 검증 테스트 (Zod 스키마 통과?)
2. 렌더러 단위 테스트 (컴포넌트 제대로 매핑?)
3. 스냅샷 테스트 (같은 스펙 → 같은 결과?)
4. E2E 테스트 (실제로 잘 보이나?)
```

**권장:**
```typescript
// 스펙 검증 테스트 예시
describe('SDUI Spec Validation', () => {
  it('should reject invalid component type', () => {
    const invalidSpec = { type: 'NonExistent', props: {} };
    expect(() => validateSpec(invalidSpec)).toThrow();
  });

  it('should reject nested Modal in Modal', () => {
    const nestedModal = {
      type: 'Modal',
      children: [{ type: 'Modal' }]
    };
    expect(() => validateComposition(nestedModal)).toThrow();
  });
});
```

---

### 팀 역할 변화

SDUI 도입하면 팀 구조도 바뀜:

```
Before:
  개발자: UI 코드 작성 → PR → 배포

After:
  콘텐츠 담당: SDUI 에디터로 스펙 작성
  개발자: 컴포넌트 & 렌더러 유지보수
  QA: 스펙 검증 + 렌더링 결과 확인
```

**주의:** 비개발자가 스펙을 만질 수 있다는 건 양날의 검. 실수로 프로덕션 UI를 망가뜨릴 수 있음. → **스테이징 환경 + 승인 워크플로우 필수**

---

### Escape Hatch (탈출구)

아무리 SDUI가 좋아도 "이건 그냥 코드로 해야겠다" 순간이 옴.

**Custom Slot 패턴:**
```json
{
  "type": "Section",
  "children": [
    { "type": "Hero", "props": { ... } },
    { "type": "CustomSlot", "slotId": "complex-chart" },
    { "type": "CTA", "props": { ... } }
  ]
}
```

```tsx
<SDUIRenderer
  endpoint="/api/sdui/dashboard"
  slots={{
    'complex-chart': <MyComplexChartComponent data={chartData} />
  }}
/>
```

이렇게 하면 SDUI 흐름 안에서 커스텀 컴포넌트 삽입 가능.

---

### 경쟁 분석

비슷한 접근법들:

| 솔루션 | 특징 | vs HUA SDUI |
|--------|------|-------------|
| **Retool** | 어드민 패널 특화 | 우린 사용자 facing UI |
| **Builder.io** | 비주얼 에디터 강점 | 우린 HUA UI 생태계 통합 |
| **Plasmic** | Figma 연동 | 우린 개발자 친화적 |
| **Contentful + React** | Headless CMS | 우린 컴포넌트 레벨 제어 |

**HUA SDUI의 차별점:**
1. HUA UI/Motion과 네이티브 통합
2. i18n 빌트인
3. 오픈소스 + Self-hosted 가능
4. 한국어 우선 문서화

---

### 언제 도입하면 좋을까?

**Green Light (도입 추천):**
- 마케팅/랜딩 페이지 자주 바꿈
- 비개발자가 콘텐츠 수정해야 함
- A/B 테스트 많이 함
- 멀티 프로젝트에서 UI 재사용

**Yellow Light (신중히):**
- 팀이 3명 미만
- 변경 빈도가 월 1회 이하
- 복잡한 비즈니스 로직이 UI에 섞여있음

**Red Light (비추천):**
- 앱이 거의 정적 (변경 빈도 거의 없음)
- 팀이 SDUI 학습 곡선 감당 못함
- 에디터 없이 JSON 직접 작성해야 하는 상황

> **참고:** 1인 개발이라도 **Hue 에디터**가 있으면 Yellow Light로 격상.
> 드래그앤드롭으로 UI 만들고 JSON 자동 생성되니까 충분히 쓸만함.

---

### 솔직한 리스크

1. **복잡도 증가**: 단순한 걸 복잡하게 만들 수 있음
2. **새로운 장애점**: SDUI 서버 죽으면 앱도 반쯤 죽음
3. **버전 지옥**: 클라이언트 렌더러 버전 vs 서버 스펙 버전 싱크
4. **성능 오버헤드**: JSON 파싱 + 동적 렌더링은 정적 코드보다 느림

이 리스크 감수할 만큼 **변경 빈도**와 **팀 규모**가 뒷받침되는지 먼저 따져봐.

---

## 로드맵

### Phase 1: Core
- [x] 스펙 파서
- [x] 기본 렌더러 (SDUIRenderer)
- [x] HUA UI 컴포넌트 바인딩
- [x] 모션 지원
- [ ] Zod 스키마 검증 (진행 중)

### Phase 2: Hue Editor ✅
> `apps/hue` - 이미 상당 부분 구현됨!

- [x] 비주얼 에디터 (드래그 앤 드롭)
- [x] 실시간 프리뷰 (SDUIRenderer 연동)
- [x] 3패널 레이아웃 (팔레트 | 캔버스 | 속성)
- [x] Undo/Redo (50단계)
- [x] JSON 내보내기/가져오기
- [x] React 코드 스니펫 생성
- [x] 반응형 프리뷰 (모바일/태블릿/데스크톱)
- [ ] 템플릿 시스템
- [ ] 버전 관리

### Phase 3: Logic & Actions ✅
- [x] 조건부 렌더링 (컨텍스트 기반)
- [x] 조건 평가 엔진 (eq, neq, gt, contains 등)
- [x] 액션 시스템 (navigate, api, setState, toast, modal)
- [x] 액션 체이닝 (onSuccess/onError)
- [ ] 중첩 조건 그룹 (AND/OR)

### Phase 4: Data & i18n (진행 예정)
- [ ] loading 스키마 / dataSource 연동
- [ ] 자동 스켈레톤 생성
- [ ] i18n 키 배정 & AI 추천
- [ ] 다국어 JSON 내보내기

### Phase 5: DX Tooling
- [ ] SDUI CLI (로컬 프리뷰)
- [ ] Hot Reloading 지원
- [ ] JSON 스펙 자동완성 (VSCode 확장)
- [ ] Storybook 연동

### Phase 6: HUA Cloud (장기)
- [ ] 호스팅 서비스 (SaaS)
- [ ] 팀 협업
- [ ] A/B 테스트 대시보드
- [ ] 애널리틱스 통합

---

## FAQ

### Q: 모든 페이지를 SDUI로 만들어야 하나요?
A: 아니요. 랜딩 페이지, 마케팅 페이지, 공지사항 등 **자주 변경되는 페이지**에 적합합니다. 복잡한 인터랙션이 필요한 페이지는 기존 방식이 나을 수 있습니다.

### Q: 커스텀 컴포넌트를 추가할 수 있나요?
A: 네, 로컬 컴포넌트 레지스트리에 등록하면 됩니다. (Phase 4 예정)

### Q: 오프라인에서도 동작하나요?
A: 캐싱 설정에 따라 가능합니다. PWA와 함께 사용하면 오프라인 지원 가능합니다.

### Q: SEO에 영향이 있나요?
A: SSR/SSG를 지원하므로 SEO 문제 없습니다. `meta` 필드로 페이지 메타데이터도 관리됩니다.

---

## 요약

| 항목 | 설명 |
|------|------|
| **핵심 가치** | UI 변경을 배포 없이 |
| **사용 방법** | `<SDUIRenderer endpoint="..." />` |
| **적합한 용도** | 랜딩, 마케팅, CMS 콘텐츠 |
| **제공 방식** | HUA Cloud (SaaS) 또는 Self-Hosted |

---

*작성일: 2026-01-16*
*상태: 개발 중 - 스펙 변경 가능*
