# 캐싱 및 성능 최적화 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **다층 캐싱 전략**과 **성능 최적화 기법**을 사용하여 응답 속도를 향상시키고 시스템 부하를 줄입니다. 이 문서는 실제 구현 코드를 기반으로 캐싱 및 성능 최적화 시스템의 상세한 아키텍처를 설명합니다.

**핵심 원칙:**
- Redis 우선, 메모리 캐시 폴백
- 계층적 캐싱
- 쿼리 최적화
- 인덱스 전략

---

## 1. 캐싱 시스템 구조

### 1.1 다층 캐싱 전략

```
요청 도착
    ↓
1단계: 메모리 캐시 확인
    ├─ Hit: 즉시 반환
    └─ Miss: 다음 단계
    ↓
2단계: Redis 캐시 확인
    ├─ Hit: 반환 + 메모리 캐시 업데이트
    └─ Miss: 다음 단계
    ↓
3단계: 데이터베이스 조회
    ├─ 결과 반환
    └─ Redis + 메모리 캐시 업데이트
```

### 1.2 구현 위치

**주요 파일:**
- `app/lib/cache.ts`: 캐싱 시스템
- `app/lib/redis.ts`: Redis 클라이언트
- `app/lib/database-optimization.ts`: 데이터베이스 최적화

---

## 2. Redis 캐싱

### 2.1 Redis 클라이언트

**구현 위치:** `app/lib/redis.ts`

**특징:**
- 싱글톤 패턴
- 자동 재연결
- 에러 시 메모리 캐시로 폴백

**설정:**
- `maxRetriesPerRequest: 3`
- `retryStrategy`: 지수 백오프 (최대 2초)
- `reconnectOnError`: READONLY 에러 시 재연결

**연결 이벤트:**
- `connect`: 연결 성공
- `error`: 연결 오류 (메모리 캐시로 폴백)

### 2.2 Redis 사용 사례

**Rate Limiting:**
- IP별 Rate Limit
- 글로벌 제한 관리

**캐싱:**
- 사용자 설정
- 분석 결과
- 할당량 정보

---

## 3. 메모리 캐시

### 3.1 메모리 캐시 구현

**구현 위치:** `app/lib/cache.ts`

**데이터 구조:**
```typescript
const memoryCache = new Map<string, {
  value: any;
  expires: number;
}>();
```

**특징:**
- 서버리스 환경에 적합
- 인스턴스별 독립적
- 만료 시간 관리

### 3.2 캐시 TTL

**설정:**
```typescript
const CACHE_TTL = {
  USER_PROFILE: 300,      // 5분
  DIARY_LIST: 60,         // 1분
  ANALYSIS_RESULT: 1800,  // 30분
  NOTIFICATIONS: 30,       // 30초
  API_RESPONSE: 300,      // 5분
} as const;
```

**전략:**
- 자주 변경되는 데이터: 짧은 TTL
- 거의 변경되지 않는 데이터: 긴 TTL

---

## 4. 캐싱 API

### 4.1 캐시 조회

**구현:** `getCache<T>(key)`

**프로세스:**
1. Redis 확인
2. Hit: 반환
3. Miss: 메모리 캐시 확인
4. Hit: 반환
5. Miss: null 반환

### 4.2 캐시 저장

**구현:** `setCache(key, value, ttlSeconds)`

**프로세스:**
1. Redis에 저장 (사용 가능 시)
2. 메모리 캐시에 저장
3. 만료 시간 설정

### 4.3 캐시 래퍼

**구현:** `withCache<T>(key, fetchFunction, ttlSeconds)`

**사용 예시:**
```typescript
const userProfile = await withCache(
  `user:${userId}:profile`,
  () => fetchUserProfile(userId),
  300 // 5분
);
```

**장점:**
- 캐시 로직 자동화
- 코드 간소화
- 일관된 캐싱

---

## 5. 데이터베이스 최적화

### 5.1 인덱스 전략

**복합 인덱스:**
- `[user_id, created_at]`: 사용자별 일기 목록
- `[user_id, deleted_at]`: 삭제된 일기 필터링
- `[provider, status, created_at]`: 프로바이더별 상태 조회

**GIN 인덱스:**
- `emotion_keywords`: 감정 키워드 배열 검색
- `summary_topics`: 토픽 배열 검색

**단일 컬럼 인덱스:**
- `email_hash`, `nickname_hash`: 해시 검색
- `deleted_at`: 소프트 삭제 필터링

### 5.2 쿼리 최적화

**Select 최적화:**
- 필요한 필드만 선택
- 관계 데이터 선택적 포함

**조건 최적화:**
- 인덱스 활용 가능한 조건 우선
- 복잡한 조건은 후처리

**Pagination:**
- `take`와 `skip` 사용
- 커서 기반 페이지네이션 (향후)

### 5.3 연결 풀 최적화

**설정:**
- 서버리스: `connection_limit=2`
- 일반 서버: `connection_limit=10`

**타임아웃:**
- `pool_timeout: 10초`
- `connect_timeout: 10초`

---

## 6. 성능 최적화 기법

### 6.1 병렬 처리

**전략:**
- 독립적인 작업은 `Promise.all()`로 병렬 실행
- 의존성이 있는 작업은 순차 실행

**예시:**
```typescript
const [rateLimit, concurrent, limits] = await Promise.all([
  checkRateLimit(userId, ip),
  checkConcurrentLimit(userId),
  getUserQuotaLimits(userId)
]);
```

### 6.2 지연 로딩

**전략:**
- 동적 import
- 필요 시에만 로드
- 번들 크기 최적화

**예시:**
```typescript
const { getOrCreateGuestUser } = await import('@/app/lib/guest-utils');
```

### 6.3 비동기 처리

**전략:**
- Fire-and-forget 패턴
- 사용자 응답에 영향 없는 작업
- 백그라운드 처리

**예시:**
```typescript
// 비동기로 위기 감지
detectCrisisAsync({...}).catch(error => {
  console.error('위기 감지 실패:', error);
});
```

---

## 7. 프론트엔드 최적화

### 7.1 코드 스플리팅

**전략:**
- 페이지별 분리
- 컴포넌트 지연 로딩
- React.lazy 사용

### 7.2 메모이제이션

**전략:**
- `React.memo`로 컴포넌트 메모이제이션
- `useMemo`로 값 메모이제이션
- `useCallback`로 함수 메모이제이션

### 7.3 이미지 최적화

**전략:**
- Next.js Image 컴포넌트
- 자동 최적화
- Lazy loading

---

## 8. 구현 상세

### 8.1 주요 함수

**캐싱:**
- `getCache<T>(key)`: 캐시 조회
- `setCache(key, value, ttlSeconds)`: 캐시 저장
- `deleteCache(key)`: 캐시 삭제
- `deleteCachePattern(pattern)`: 패턴으로 삭제
- `withCache<T>(key, fetchFunction, ttlSeconds)`: 캐시 래퍼

**Redis:**
- `getRedisClient()`: Redis 클라이언트 가져오기
- `isRedisAvailable()`: Redis 사용 가능 여부
- `checkRateLimit(key, limit, windowSeconds)`: Redis 기반 Rate Limiting

**유틸리티:**
- `getUserCacheKey(userId, type, params?)`: 사용자별 캐시 키
- `getGlobalCacheKey(type, params?)`: 전역 캐시 키
- `getCacheStats()`: 캐시 통계

### 8.2 캐시 키 전략

**사용자별 캐시:**
- 형식: `user:{userId}:{type}:{params}`
- 예시: `user:123:profile:{}`

**전역 캐시:**
- 형식: `global:{type}:{params}`
- 예시: `global:stats:{}`

---

## 9. 성능 모니터링

### 9.1 캐시 통계

**구현:** `getCacheStats()`

**반환 값:**
```typescript
{
  type: 'redis' | 'memory';
  size: number;
  keys: string[];
}
```

### 9.2 성능 메트릭

**추적 항목:**
- API 응답 시간
- 데이터베이스 쿼리 시간
- 캐시 Hit/Miss 비율
- Redis 연결 상태

---

## 10. 참고 자료

### 관련 코드 파일
- `app/lib/cache.ts`: 캐싱 시스템
- `app/lib/redis.ts`: Redis 클라이언트
- `app/lib/database-optimization.ts`: 데이터베이스 최적화

### 관련 문서
- [데이터 레이어](./DATA_LAYER.md)
- [할당량 및 비용 관리](./QUOTA_AND_BILLING_SYSTEM.md)

---

## 11. 향후 개선 계획

### 11.1 계획된 개선사항

1. **캐시 무효화 전략**
   - 이벤트 기반 무효화
   - 태그 기반 무효화

2. **CDN 통합**
   - 정적 자산 CDN
   - 이미지 최적화

3. **쿼리 최적화**
   - 쿼리 분석 도구
   - 느린 쿼리 감지

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
