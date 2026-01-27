# 데이터 레이어 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **PostgreSQL** 데이터베이스와 **Prisma ORM**을 사용하여 데이터를 관리합니다. 이 문서는 실제 스키마와 구현을 기반으로 데이터 레이어의 상세한 아키텍처를 설명합니다.

**핵심 원칙:**
- 스키마 분리: `user` 스키마와 `admin` 스키마로 분리
- 암호화 우선: 모든 개인정보는 암호화되어 저장
- 인덱스 최적화: 쿼리 성능을 위한 전략적 인덱싱
- 트랜잭션 보장: 데이터 일관성 유지

---

## 1. 데이터베이스 구조

### 1.1 스키마 분리

**스키마 구조:**
- `user` 스키마: 사용자 데이터, 일기, 분석 결과
- `admin` 스키마: 관리자 전용 데이터 (향후 확장)

**Prisma 설정:**
```prisma
datasource db {
  provider = "postgresql"
  schemas  = ["user", "admin"]
}
```

**이유:**
- 데이터 격리
- 권한 관리 용이
- 확장성 향상

### 1.2 연결 관리

**구현 위치:** `app/lib/prisma.ts`

**PrismaClient 싱글톤:**
- Lazy Initialization 패턴
- 개발 환경: globalThis에 캐시
- 프로덕션: 새 인스턴스 생성

**연결 풀 최적화:**
```typescript
function optimizeDatabaseUrl(url: string | undefined): string {
  // 서버리스 환경: connection_limit=2
  // 일반 서버: connection_limit=10
  const isServerless = !!process.env.VERCEL;
  const connectionLimit = isServerless ? '2' : '10';
  
  // 연결 풀 파라미터 자동 추가
  // connection_limit, pool_timeout, connect_timeout
}
```

**Prisma Adapter:**
- `@prisma/adapter-pg` 사용
- PostgreSQL 네이티브 연결

---

## 2. 핵심 모델 구조

### 2.1 User (사용자)

**스키마:** `user.User`

**주요 필드:**
```prisma
model User {
  id            String    @id @default(uuid())
  email_hash    String?   @unique // SHA-256 해시 (검색용)
  nickname_hash String?   @unique // SHA-256 해시 (검색용)
  state         UserState @default(active)
  role          UserRole  @default(USER)
  
  // 암호화된 개인정보
  name_enc     Bytes?
  email_enc    Bytes?
  nickname_enc Bytes?
  
  // Relations
  diaries      DiaryEntry[]
  quota        UserQuota?
  settings     UserSettings?
  // ... 기타 관계
}
```

**인덱스:**
- `email_hash`: 이메일 검색
- `nickname_hash`: 닉네임 검색
- `state`: 상태별 조회
- `role`: 역할별 조회
- `created_at`: 생성일 기준 조회

**특징:**
- 게스트 사용자: `email_hash = null`, `nickname_hash = null`
- NULL은 unique 제약에서 여러 개 허용 (게스트 지원)
- 암호화 필드는 `Bytes` 타입 사용

### 2.2 DiaryEntry (일기)

**스키마:** `user.DiaryEntry`

**주요 필드:**
```prisma
model DiaryEntry {
  id          String    @id @default(uuid())
  user_id     String
  title       String?
  content_enc Bytes     // 암호화된 일기 내용
  
  // 시간 정보
  diary_date        DateTime? // 사용자 선택 날짜
  actual_written_at DateTime  @default(now()) // 실제 작성 시간
  is_delayed_entry  Boolean  @default(false) // 지연된 일기 작성 여부
  
  // 삭제 관리 (Soft Delete)
  deleted_at  DateTime?
  deleted_by  String?
  
  // 분석 제외 플래그
  exclude_from_analysis Boolean @default(false)
  
  // Relations
  analysis_results AnalysisResult[]
  user             User
}
```

**인덱스:**
- `[user_id, created_at]`: 사용자별 일기 목록
- `[deleted_at]`: 삭제된 일기 필터링
- `[user_id, deleted_at]`: 사용자별 삭제된 일기 조회
- `[exclude_from_analysis]`: 분석 제외 필터링
- `[user_id, diary_date]`: 일기 날짜 조회
- `[title]`: 제목 검색

**일기 타입:**
- **오늘 일기**: `diary_date === today`, `is_delayed_entry = false`
- **나중 일기**: `diary_date < today`, `is_delayed_entry = true`, 수정 불가
- **미래 일기**: `diary_date > today`, `is_delayed_entry = false`, 수정 가능

### 2.3 AnalysisResult (분석 결과)

**스키마:** `user.AnalysisResult`

**주요 필드:**
```prisma
model AnalysisResult {
  id       String           @id @default(uuid())
  diary_id String
  provider AnalysisProvider @default(OPENAI)
  status   AnalysisStatus   @default(PENDING)
  
  // 암호화된 분석 결과
  title_enc               Bytes? // user_response.title
  summary_enc             Bytes? // user_response.summary
  emotion_flow_enc        Bytes? // user_response.emotion_flow
  reflection_question_enc Bytes? // user_response.question
  interpretation_enc      Bytes? // user_response.interpretation
  
  // 검색용 메타데이터 (평문)
  emotion_keywords String[] // 감정 키워드
  summary_topics   String[] // 토픽 태그
  
  // 구조화된 메타데이터
  mode          String?
  tone          String?
  affect_tier   Float? // tier_a
  momentum_tier Float? // tier_m
  ethics        String[]
  confidence    Float?
  primary_emotions EmotionTag[]
  slip             SlipLevel?
  
  // 기술적 메타데이터
  model_name     String?
  model_version  String?
  prompt_version String?
  input_tokens   Int?
  output_tokens  Int?
  cost_usd       Decimal?
  latency        Int?
  
  // 원본 응답
  raw_ai_response_enc Bytes? // 암호화된 원본 응답
}
```

**인덱스:**
- `[diary_id, created_at]`: 일기별 분석 결과
- `[provider, status]`: 프로바이더별 상태 조회
- `[tone, mode]`: 톤/모드별 조회
- `[affect_tier, momentum_tier]`: 티어별 조회
- `[emotion_keywords]` (GIN): 감정 키워드 검색
- `[summary_topics]` (GIN): 토픽 검색
- `[created_at, cost_usd]`: 일별 비용 분석

**GIN 인덱스:**
- 배열 필드 검색 최적화
- PostgreSQL GIN 인덱스 사용

### 2.4 HuaEmotionAnalysis (HUA 감정 엔진 분석)

**스키마:** `user.HuaEmotionAnalysis`

**주요 필드:**
```prisma
model HuaEmotionAnalysis {
  id                 String @id @default(uuid())
  analysis_result_id String @unique
  
  // 규칙 기반 메트릭
  coordinates       Json? // Valence-Arousal 좌표
  entropy           Float? // Shannon Entropy
  dominant_emotion  String?
  emotion_density   Float?
  tense_changes     Int?
  first_person_freq Float?
  transitions       Json?
  
  // AI 기반 메트릭
  ai_entropy        Float?
  ai_density        Float?
  ai_transitions    Json?
  ai_diversity      Float?
  
  // 고급 분석
  emotion_timeline  Json?
  sentiment_score   Float?
  complexity_metrics Json?
  visualization_data Json?
}
```

**특징:**
- 1:1 관계 (AnalysisResult와)
- 정량적 메트릭 저장
- JSON 필드로 유연한 데이터 구조

### 2.5 UserQuota (할당량)

**스키마:** `user.UserQuota`

**주요 필드:**
```prisma
model UserQuota {
  user_id        String   @id @unique
  is_premium     Boolean  @default(false)
  
  // 일일 할당량
  daily_sent_count    Int      @default(0)
  daily_sent_limit    Int      @default(10) // 무료: 10, 프리미엄: 100
  daily_reset_at      DateTime
  
  // 월간 할당량
  monthly_sent_count   Int      @default(0)
  monthly_sent_limit  Int      @default(300) // 무료: 300, 프리미엄: 3000
  monthly_reset_at     DateTime
}
```

**할당량 로직:**
- 전송 단일 Quota 시스템
- 전송 1회 = 일기 1개 + 분석 1회
- 리셋 시간: 일일(자정), 월간(매월 1일)

### 2.6 BillingRecord (비용 집계)

**스키마:** `user.BillingRecord`

**주요 필드:**
```prisma
model BillingRecord {
  id                 String   @id @default(uuid())
  date               DateTime @db.Date
  user_id            String?
  provider           String
  model              String
  
  total_input_tokens  Int
  total_output_tokens  Int
  total_cost_usd      Decimal @db.Decimal(10, 6)
}
```

**집계 전략:**
- 실시간 upsert
- 프로바이더별 분리
- 일별/월별/사용자별 집계

---

## 3. 트랜잭션 관리

### 3.1 트랜잭션 사용

**일기 생성 시:**
```typescript
await prisma.$transaction(async (tx) => {
  // 1. 일기 저장
  const diary = await tx.diaryEntry.create({...});
  
  // 2. 분석 결과 PENDING 생성
  await tx.analysisResult.create({
    data: {
      diary_id: diary.id,
      status: 'PENDING',
      ...
    }
  });
  
  // 3. Quota 체크 및 예약
  // ...
}, {
  timeout: 30000, // 30초 타임아웃
  maxWait: 10000,  // 최대 대기 시간
});
```

**트랜잭션 옵션:**
- `timeout`: 트랜잭션 타임아웃 (기본: 30초)
- `maxWait`: 대기 시간 (기본: 10초)
- `isolationLevel`: 격리 수준 (기본: Read Committed)

### 3.2 트랜잭션 패턴

**읽기-수정-쓰기:**
- Quota 증가 시 트랜잭션 사용
- 동시성 보장

**배치 작업:**
- 여러 레코드 동시 업데이트
- 원자성 보장

---

## 4. 쿼리 최적화

### 4.1 인덱스 전략

**복합 인덱스:**
- `[user_id, created_at]`: 사용자별 일기 목록 (최신순)
- `[user_id, deleted_at]`: 사용자별 삭제된 일기 조회
- `[provider, status, created_at]`: 프로바이더별 상태 조회

**GIN 인덱스:**
- `emotion_keywords`: 감정 키워드 배열 검색
- `summary_topics`: 토픽 배열 검색

**단일 컬럼 인덱스:**
- `email_hash`, `nickname_hash`: 해시 검색
- `deleted_at`: 소프트 삭제 필터링
- `exclude_from_analysis`: 분석 제외 필터링

### 4.2 쿼리 헬퍼

**구현 위치:** `app/lib/analysis-query-helpers.ts`

**주요 함수:**
- `getAnalysisDiaries(options)`: 분석 대상 일기 조회
- `getUserDiaryStats(userId, options)`: 사용자별 통계
- `getEmotionStats(options)`: 감정 통계
- `getAbuseStats(options)`: 악용 통계

**필터링 조건:**
```typescript
export const EXCLUDE_FROM_ANALYSIS_WHERE = {
  exclude_from_analysis: false,
  deleted_at: null,
} as const;
```

### 4.3 쿼리 최적화 기법

**Select 최적화:**
- 필요한 필드만 선택
- 관계 데이터 선택적 포함

**Pagination:**
- `take`와 `skip` 사용
- 커서 기반 페이지네이션 (향후)

**조건부 Include:**
- 필요한 관계만 포함
- 중첩 관계 제한

---

## 5. 데이터 마이그레이션

### 5.1 Prisma 마이그레이션

**마이그레이션 파일:**
- `prisma/migrations/`: 마이그레이션 히스토리
- `prisma/schema.prisma`: 스키마 정의

**마이그레이션 실행:**
```bash
# 개발 환경
pnpm prisma migrate dev --name migration_name

# 프로덕션
pnpm prisma migrate deploy
```

### 5.2 스키마 변경 전략

**안전한 변경:**
- NULL 허용 필드 추가
- 인덱스 추가
- Enum 값 추가

**주의 필요한 변경:**
- 필수 필드 추가 (기본값 필요)
- 관계 변경 (데이터 마이그레이션 필요)
- 타입 변경 (변환 로직 필요)

---

## 6. 연결 풀 관리

### 6.1 연결 풀 설정

**서버리스 환경 (Vercel):**
- `connection_limit: 2`
- 함수당 최소 연결 유지
- 메모리 절약

**일반 서버:**
- `connection_limit: 10`
- 더 많은 동시 연결 지원

**타임아웃:**
- `pool_timeout: 10초`
- `connect_timeout: 10초`

### 6.2 연결 풀 최적화

**자동 최적화:**
- `optimizeDatabaseUrl()` 함수로 자동 파라미터 추가
- 환경별 최적 설정 적용

**모니터링:**
- 연결 풀 상태 추적
- 타임아웃 발생 모니터링

---

## 7. 데이터 일관성

### 7.1 외래키 제약

**Cascade 삭제:**
- `User` 삭제 시 `DiaryEntry` 자동 삭제
- `DiaryEntry` 삭제 시 `AnalysisResult` 자동 삭제

**SetNull:**
- `deleted_by` 관계는 SetNull (사용자 삭제 시)

### 7.2 트랜잭션 일관성

**원자성 보장:**
- 여러 작업을 하나의 트랜잭션으로 묶음
- 실패 시 전체 롤백

**격리 수준:**
- Read Committed (기본)
- 필요 시 더 높은 격리 수준 사용

---

## 8. 성능 최적화

### 8.1 인덱스 최적화

**전략:**
- 자주 조회되는 컬럼에 인덱스
- 복합 인덱스로 쿼리 최적화
- GIN 인덱스로 배열 검색 최적화

**인덱스 유지:**
- 정기적인 인덱스 재구성
- 사용하지 않는 인덱스 제거

### 8.2 쿼리 최적화

**Select 최적화:**
- 필요한 필드만 선택
- 불필요한 관계 포함 제거

**조건 최적화:**
- 인덱스 활용 가능한 조건 우선
- 복잡한 조건은 후처리

---

## 9. 구현 상세

### 9.1 Prisma Client 사용

**싱글톤 패턴:**
```typescript
const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}
```

**Lazy Initialization:**
- 빌드 시 DB 연결 시도 방지
- 실제 사용 시에만 초기화

### 9.2 주요 쿼리 패턴

**일기 조회:**
```typescript
const diaries = await prisma.diaryEntry.findMany({
  where: {
    user_id: userId,
    deleted_at: null,
    exclude_from_analysis: false,
  },
  include: {
    analysis_results: {
      where: { status: 'COMPLETED' },
      take: 1,
      orderBy: { created_at: 'desc' },
    },
  },
  orderBy: { created_at: 'desc' },
});
```

**분석 결과 조회:**
```typescript
const analysis = await prisma.analysisResult.findFirst({
  where: {
    diary_id: diaryId,
    status: 'COMPLETED',
  },
  include: {
    hua_analysis: true,
    system_metadata: true,
  },
});
```

---

## 10. 참고 자료

### 관련 코드 파일
- `prisma/schema.prisma`: 스키마 정의
- `app/lib/prisma.ts`: Prisma Client 싱글톤
- `app/lib/analysis-query-helpers.ts`: 쿼리 헬퍼

### 관련 문서
- [데이터베이스 스키마](../DATABASE_SCHEMA.md)
- [스키마 개선 결정](../guides/SCHEMA_IMPROVEMENT_DECISIONS.md)
- [스키마 쿼리 최적화](../guides/SCHEMA_QUERY_OPTIMIZATION.md)

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
