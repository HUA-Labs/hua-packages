# 서비스 레이어 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **서비스 레이어 패턴**을 사용하여 비즈니스 로직을 모듈화합니다. 이 문서는 실제 구현 코드를 기반으로 서비스 레이어의 상세한 아키텍처를 설명합니다.

**핵심 원칙:**
- 단일 책임 원칙
- 의존성 주입
- 서비스 간 독립성
- 재사용 가능한 모듈

---

## 1. 서비스 레이어 구조

### 1.1 서비스 분류

**구현 위치:** `app/lib/`

**주요 서비스:**

**AI 분석 서비스:**
- `diary-analysis-service.ts`: 1차 AI 분석
- `hua-ai-service.ts`: 2차 HUA 감정 엔진
- `analysis-service.ts`: 분석 오케스트레이션
- `prompt-templates.ts`: 프롬프트 관리

**보안 서비스:**
- `encryption.ts`: 암호화/복호화
- `user-encryption.ts`: 사용자별 암호화
- `client-encryption.ts`: 클라이언트 암호화
- `key-management.ts`: 키 관리
- `crisis-detection-service.ts`: 위기 감지
- `abuse-detection.ts`: 악용 탐지
- `anonymizer.ts`: 익명화

**할당량 및 비용:**
- `quota.ts`: Quota 관리
- `quota-check.ts`: 통합 제한 체크
- `rate-limit.ts`: Rate Limiting
- `concurrent-limit.ts`: 동시 실행 제한
- `billing.ts`: 비용 집계
- `ai-cost-calculator.ts`: AI 비용 계산

**게스트 및 사용자:**
- `guest-utils.ts`: 게스트 유틸리티
- `guest-migration.ts`: 게스트 마이그레이션
- `guest-limiter.ts`: 게스트 제한
- `client-guest-id.ts`: 클라이언트 게스트 ID
- `user-settings.ts`: 사용자 설정
- `user-settings-server.ts`: 서버 사이드 설정

**데이터 및 유틸리티:**
- `prisma.ts`: Prisma Client
- `date-utils.ts`: 날짜 유틸리티
- `search-utils.ts`: 검색 유틸리티
- `sentiment-utils.ts`: 감정 유틸리티
- `utils.ts`: 공통 유틸리티
- `validation-schemas.ts`: 검증 스키마

**기타 서비스:**
- `email-service.ts`: 이메일 전송
- `offline-storage.ts`: 오프라인 저장
- `cache.ts`: 캐싱
- `redis.ts`: Redis 클라이언트
- `admin.ts`: 관리자 유틸리티

---

## 2. 서비스 설계 원칙

### 2.1 단일 책임 원칙

**각 서비스는 하나의 책임만 가짐:**

- `encryption.ts`: 암호화/복호화만 담당
- `quota.ts`: Quota 관리만 담당
- `rate-limit.ts`: Rate Limiting만 담당

### 2.2 의존성 주입

**패턴:**
- 함수 기반 서비스
- 필요한 의존성을 파라미터로 전달
- 테스트 용이성

**예시:**
```typescript
// 의존성을 파라미터로 전달
export async function analyzeDiary(
  diaryContent: string,
  userId?: string
) {
  const userProvider = userId 
    ? await getUserAiProvider(userId) 
    : 'openai';
  // ...
}
```

### 2.3 서비스 간 통신

**패턴:**
- 직접 함수 호출
- 공통 인터페이스 사용
- 에러 전파

---

## 3. 주요 서비스 모듈

### 3.1 AI 분석 서비스

**diary-analysis-service.ts:**
- 1차 AI 분석 오케스트레이션
- 프로바이더 선택
- 프롬프트 생성
- 응답 파싱
- 슬립 계산

**hua-ai-service.ts:**
- 2차 HUA 감정 엔진 분석
- 정량적 메트릭 계산
- 익명화된 텍스트 사용

**prompt-templates.ts:**
- 프롬프트 템플릿 관리
- 토큰 사용량 예상
- 시스템 프롬프트 고정값

### 3.2 보안 서비스

**encryption.ts:**
- AES-256-GCM 암호화
- PBKDF2 키 파생
- 데이터 무결성 검증

**crisis-detection-service.ts:**
- 3단계 안전망
- 히스토리 기반 Escalation
- 재식별 위험 평가

**abuse-detection.ts:**
- 다층 방어 시스템
- 패턴 탐지
- 점진적 제재

### 3.3 할당량 및 비용 서비스

**quota.ts:**
- Quota 체크
- Quota 증가
- 사용자별 제한 조회

**billing.ts:**
- BillingRecord 집계
- 실시간 비용 추적
- 프로바이더별 분리

**ai-cost-calculator.ts:**
- 환경변수 기반 가격
- 토큰 비용 계산
- 동적 가격 설정

### 3.4 게스트 및 사용자 서비스

**guest-utils.ts:**
- 게스트 사용자 생성/조회
- 게스트 ID 추출

**user-settings.ts:**
- 사용자 설정 조회
- AI 프로바이더 설정
- 클라이언트 사이드

**user-settings-server.ts:**
- 서버 사이드 설정 조회
- 데이터베이스 접근

---

## 4. 서비스 인터페이스

### 4.1 인터페이스 정의

**QuotaStore 인터페이스:**
```typescript
export interface QuotaStore {
  get(userId: string, period: 'daily' | 'monthly'): Promise<QuotaData>;
  increment(userId: string, period: 'daily' | 'monthly'): Promise<void>;
  reset(userId: string, period: 'daily' | 'monthly'): Promise<void>;
}
```

**의존성 주입:**
- 인터페이스로 추상화
- 구현체 교체 가능
- 테스트 용이

### 4.2 싱글톤 패턴

**사용 사례:**
- Prisma Client
- Redis Client
- OfflineStorage
- NetworkStatus

**구현:**
```typescript
class OfflineStorage {
  private static instance: OfflineStorage;
  
  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }
}
```

---

## 5. 에러 처리

### 5.1 에러 타입

**커스텀 에러:**
- `QuotaExceededError`
- `RateLimitExceededError`
- `ConcurrentLimitExceededError`
- `AuthRequiredError`
- `ApiError`

### 5.2 에러 전파

**패턴:**
- 서비스에서 에러 발생
- API 레이어에서 캐치
- 사용자 친화적 메시지 변환

---

## 6. 유틸리티 서비스

### 6.1 날짜 유틸리티

**구현 위치:** `app/lib/date-utils.ts`

**기능:**
- 한국 시간 변환
- 날짜 포맷팅
- 날짜 파싱

### 6.2 검색 유틸리티

**구현 위치:** `app/lib/search-utils.ts`

**기능:**
- 검색어 하이라이트
- 검색 결과 필터링
- 정렬

### 6.3 감정 유틸리티

**구현 위치:** `app/lib/sentiment-utils.ts`

**기능:**
- 감정 색상 매핑
- 감정 표시
- 감정 분석

---

## 7. 구현 상세

### 7.1 서비스 모듈 목록

**AI 분석:**
- `diary-analysis-service.ts`
- `hua-ai-service.ts`
- `analysis-service.ts`
- `prompt-templates.ts`
- `slip-calculator.ts`

**보안:**
- `encryption.ts`
- `user-encryption.ts`
- `client-encryption.ts`
- `key-management.ts`
- `crisis-detection-service.ts`
- `abuse-detection.ts`
- `anonymizer.ts`

**할당량:**
- `quota.ts`
- `quota-check.ts`
- `rate-limit.ts`
- `concurrent-limit.ts`
- `billing.ts`
- `ai-cost-calculator.ts`

**게스트:**
- `guest-utils.ts`
- `guest-migration.ts`
- `guest-limiter.ts`
- `client-guest-id.ts`

**사용자:**
- `user-settings.ts`
- `user-settings-server.ts`
- `nickname-generator.ts`

**유틸리티:**
- `date-utils.ts`
- `search-utils.ts`
- `sentiment-utils.ts`
- `utils.ts`
- `validation-schemas.ts`
- `text-config.ts`

**기타:**
- `email-service.ts`
- `offline-storage.ts`
- `cache.ts`
- `redis.ts`
- `admin.ts`
- `admin-audit-log.ts`
- `database-optimization.ts`

### 7.2 서비스 간 의존성

**의존성 그래프:**
```
API Layer
    ↓
Service Layer
    ├─ AI Analysis Services
    ├─ Security Services
    ├─ Quota Services
    ├─ Guest Services
    └─ Utility Services
    ↓
Data Layer (Prisma)
```

---

## 8. 성능 고려사항

### 8.1 지연 로딩

**전략:**
- 동적 import
- 필요 시에만 로드
- 번들 크기 최적화

### 8.2 캐싱

**전략:**
- 사용자 설정 캐싱
- 분석 결과 캐싱
- Redis 활용

---

## 9. 참고 자료

### 관련 코드 파일
- `app/lib/`: 모든 서비스 모듈

### 관련 문서
- [AI 분석 시스템](./AI_ANALYSIS_SYSTEM.md)
- [암호화 시스템](./ENCRYPTION_SYSTEM.md)
- [할당량 및 비용 관리](./QUOTA_AND_BILLING_SYSTEM.md)

---

## 10. 향후 개선 계획

### 10.1 계획된 개선사항

1. **의존성 주입 컨테이너**
   - IoC 컨테이너 도입
   - 더 나은 테스트 가능성

2. **서비스 인터페이스 표준화**
   - 공통 인터페이스 정의
   - 구현체 교체 용이

3. **서비스 모니터링**
   - 성능 추적
   - 에러 추적

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
