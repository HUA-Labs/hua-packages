# 성능 최적화 가이드

> 최종 업데이트: 2025-12-16

## 개요

숨다이어리의 성능 최적화 전략은 캐싱, 데이터베이스 최적화, 쿼리 최적화를 통해 사용자 경험을 향상시킵니다.

## 캐싱 전략

### 1. Redis 캐싱 (권장)

#### Redis 설치

```bash
# Docker로 Redis 실행
docker run -d -p 6379:6379 --name redis redis:alpine

# 환경 변수 설정
echo "REDIS_URL=redis://localhost:6379" >> .env.local
```

#### 캐싱 사용

```typescript
import { withCache, getUserCacheKey, CACHE_TTL } from '@/app/lib/cache';

// 사용자 프로필 캐싱
const userProfile = await withCache(
  getUserCacheKey(userId, 'profile'),
  () => fetchUserProfile(userId),
  CACHE_TTL.USER_PROFILE // 5분
);

// 일기 목록 캐싱
const diaryList = await withCache(
  getUserCacheKey(userId, 'diaries', { page: 1 }),
  () => fetchDiaryList(userId, 1),
  CACHE_TTL.DIARY_LIST // 1분
);

// 분석 결과 캐싱 (30분)
const analysis = await withCache(
  getUserCacheKey(userId, 'analysis', { diaryId }),
  () => fetchAnalysisResult(diaryId),
  CACHE_TTL.ANALYSIS_RESULT // 30분
);
```

#### 캐시 삭제

```typescript
import { deleteCache, deleteCachePattern } from '@/app/lib/cache';

// 특정 캐시 삭제
await deleteCache(getUserCacheKey(userId, 'profile'));

// 패턴으로 캐시 삭제
await deleteCachePattern(`user:${userId}:*`);

// 전역 캐시 삭제
await deleteCachePattern('global:*');
```

### 2. 메모리 캐시 (폴백)

Redis가 없을 경우 자동으로 메모리 캐시를 사용합니다.

```typescript
// 메모리 캐시 자동 사용
const data = await withCache('my-key', fetchData, 300);
```

## 데이터베이스 최적화

### 1. 인덱스 생성

#### API 사용

```bash
# API로 인덱스 생성
curl -X POST http://localhost:3000/api/admin/optimize-database \
  -H "Content-Type: application/json" \
  -d '{"action": "create_indexes"}'
```

#### 프로그래밍 방식

```typescript
import { createOptimizedIndexes } from '@/app/lib/database-optimization';

// 인덱스 생성 (비동기)
await createOptimizedIndexes();
```

#### 주요 인덱스

| 테이블 | 인덱스 이름 | 용도 |
|--------|-----------|------|
| `User` | `idx_users_email` | 이메일 검색 |
| `User` | `idx_users_nickname` | 닉네임 검색 |
| `User` | `idx_users_state` | 상태 필터링 |
| `DiaryEntry` | `idx_diary_entries_user_id` | 사용자별 일기 조회 |
| `DiaryEntry` | `idx_diary_entries_created_at` | 날짜 정렬 |
| `DiaryEntry` | `idx_diary_entries_user_created` | 사용자별 날짜 정렬 |
| `Notification` | `idx_notifications_user_read_created` | 읽음 상태 필터링 |

### 2. 쿼리 최적화

#### 성능 분석

```typescript
import { analyzeQueryPerformance } from '@/app/lib/database-optimization';

// 쿼리 성능 분석
const performance = await analyzeQueryPerformance();
console.log('느린 쿼리:', performance.slowQueries);
console.log('테이블 크기:', performance.tableSizes);
console.log('인덱스 사용률:', performance.indexUsage);
```

#### 최적화 예시

```typescript
// 비효율적인 쿼리
const diaries = await prisma.diaryEntry.findMany({
  where: { user_id: userId },
  orderBy: { created_at: 'desc' }
});

// 최적화된 쿼리 (필터링 추가)
const diaries = await prisma.diaryEntry.findMany({
  where: { 
    user_id: userId,
    is_deleted: false // 삭제되지 않은 것만
  },
  orderBy: { created_at: 'desc' },
  take: 20 // 페이지네이션
});
```

### 3. 데이터 정리

#### API 사용

```bash
# API로 데이터 정리
curl -X POST http://localhost:3000/api/admin/optimize-database \
  -H "Content-Type: application/json" \
  -d '{"action": "cleanup"}'
```

#### 정리 대상

| 데이터 타입 | 보관 기간 | 정리 주기 |
|------------|----------|-----------|
| 로그인 로그 | 30일 | 매일 |
| API 로그 | 30일 | 매일 |
| 에러 로그 | 30일 | 매일 |
| 읽은 알림 | 7일 | 매일 |

## 모니터링

### 1. 관리자 대시보드

#### 접근

```
http://localhost:3000/admin/optimization
```

#### 제공 정보

- **데이터베이스 통계**: 테이블별 레코드 수
- **캐시 상태**: Redis/메모리 캐시 상태
- **성능 지표**: 쿼리 응답 시간, 캐시 히트율
- **인덱스 사용률**: 인덱스별 사용 빈도

### 2. API 모니터링

#### 데이터베이스 통계

```bash
curl http://localhost:3000/api/admin/database-stats
```

**응답:**
```json
{
  "success": true,
  "stats": [
    { "table_name": "users", "count": "150" },
    { "table_name": "diary_entries", "count": "1250" },
    { "table_name": "analysis_results", "count": "1200" }
  ]
}
```

#### 캐시 통계

```bash
curl http://localhost:3000/api/admin/cache-stats
```

**응답:**
```json
{
  "success": true,
  "stats": {
    "type": "redis",
    "size": 45,
    "keys": ["user:123:profile", "global:notifications", "user:456:diaries"]
  }
}
```

## 캐싱 계층 구조

### 1. 다층 캐싱

```
사용자 요청
    ↓
메모리 캐시 (L1) ← 최우선 확인
    ↓
Redis 캐시 (L2) ← 두 번째 확인
    ↓
데이터베이스 (L3) ← 최종 확인
```

#### 캐시 TTL 설정

| 캐시 타입 | TTL | 용도 |
|-------------|-----|------|
| 사용자 프로필 | 5분 | 프로필 정보 |
| 일기 목록 | 1분 | 일기 목록 |
| 분석 결과 | 30분 | AI 분석 결과 |
| 알림 | 30초 | 알림 목록 |

### 2. 쿼리 최적화

#### 인덱스 활용

1. **WHERE 절 최적화**: 인덱스가 있는 컬럼 사용
2. **JOIN 최적화**: 필요한 컬럼만 SELECT
3. **정렬 최적화**: 인덱스가 있는 컬럼로 정렬
4. **페이지네이션**: LIMIT/OFFSET 사용

#### 쿼리 패턴

1. **SELECT 최소화**: 필요한 컬럼만 선택
2. **WHERE 조건 최적화**: 인덱스 활용
3. **JOIN 최소화**: 필요한 경우만 JOIN
4. **서브쿼리 최적화**: LIMIT/OFFSET 활용

### 3. API 응답 최적화

#### 압축

```typescript
// Next.js 자동 압축
// next.config.js
module.exports = {
  compress: true,
  // ...
};
```

#### 배치 처리

```typescript
// 개별 생성 대신 배치 생성
const notifications = await prisma.notification.createMany({
  data: notificationData,
  skipDuplicates: true
});
```

## 성능 목표

### 1. 응답 시간

| 엔드포인트 | 목표 | 현재 | 개선율 |
|-----------|------|------|--------|
| 일기 목록 | 200ms | 50ms | 75% 개선 |
| 프로필 조회 | 100ms | 20ms | 80% 개선 |
| 분석 결과 | 150ms | 30ms | 80% 개선 |
| 검색 | 500ms | 100ms | 80% 개선 |

### 2. 캐시 히트율

#### 측정 방법

```typescript
// API 응답 시간 측정
const start = Date.now();
const result = await apiCall();
const duration = Date.now() - start;
console.log(`API 응답 시간: ${duration}ms`);
```

#### 캐시 히트율 계산

```typescript
// 캐시 통계 확인
const cacheStats = await getCacheStats();
const hitRate = (cacheStats.hits / cacheStats.total) * 100;
console.log(`캐시 히트율: ${hitRate.toFixed(2)}%`);
```

## 문제 해결

### 1. 캐시 문제

#### Redis 연결 확인

```bash
# Redis 상태 확인
docker ps | grep redis

# Redis 재시작
docker restart redis
```

#### 메모리 캐시 관리

```typescript
// 메모리 캐시 크기 제한
const MAX_CACHE_SIZE = 1000;
if (memoryCache.size > MAX_CACHE_SIZE) {
  // 오래된 키 삭제
  const oldestKey = memoryCache.keys().next().value;
  memoryCache.delete(oldestKey);
}
```

### 2. 데이터베이스 성능

#### 느린 쿼리 확인

```sql
-- 느린 쿼리 확인
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;
```

#### 인덱스 사용률 확인

```sql
-- 인덱스 사용률 확인
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## 향후 개선 사항

### 1. 캐싱

- [ ] Redis 필수화 (메모리 캐시 제거)
- [ ] 캐시 워밍업 전략
- [ ] 분산 캐싱

### 2. 데이터베이스

- [ ] 읽기 전용 복제본
- [ ] 파티셔닝
- [ ] 쿼리 최적화 자동화

### 3. API

- [ ] GraphQL 도입 검토
- [ ] 응답 압축 강화
- [ ] CDN 도입

---

**최종 업데이트**: 2025-11-07
