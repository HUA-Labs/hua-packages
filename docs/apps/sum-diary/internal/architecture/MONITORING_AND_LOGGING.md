# 모니터링 및 로깅 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **다층 로깅 시스템**을 통해 시스템 상태를 추적하고 모니터링합니다. 이 문서는 실제 구현 코드를 기반으로 모니터링 및 로깅 시스템의 상세한 아키텍처를 설명합니다.

**핵심 원칙:**
- 구조화된 로깅
- 성능 추적
- 에러 추적
- 보안 감사

---

## 1. 로깅 시스템 구조

### 1.1 로그 타입

**구현 위치:** `prisma/schema.prisma`

**로그 모델:**

**LoginLog:**
- 사용자 로그인/로그아웃
- 게스트 사용 추적
- IP 및 User-Agent 기록

**ApiLog:**
- API 요청/응답
- 성능 메트릭 (latency_ms)
- 상태 코드

**ErrorLog:**
- 에러 로그
- 심각도 (severity)
- 스택 트레이스

**AuditLog:**
- 관리자 활동
- 보안 감사
- 중요 작업 추적

### 1.2 로깅 플로우

```
요청/이벤트 발생
    ↓
로그 생성
    ├─ LoginLog: 로그인/게스트 사용
    ├─ ApiLog: API 요청
    ├─ ErrorLog: 에러 발생
    └─ AuditLog: 관리자 활동
    ↓
데이터베이스 저장
    ↓
정기적 정리 (30일 이상)
```

---

## 2. 로그 모델 상세

### 2.1 LoginLog

**스키마:**
```prisma
model LoginLog {
  id         String   @id @default(uuid())
  user_id    String?
  is_guest   Boolean  @default(false)
  ip         String?
  ua         String?  @map("user_agent")
  action     String? // diary_write, diary_analyze, login, logout
  success    Boolean?
  created_at DateTime @default(now())
}
```

**인덱스:**
- `[user_id, created_at]`: 사용자별 로그
- `[is_guest, created_at]`: 게스트 로그
- `[ip, created_at]`: IP별 로그
- `[ip, action, created_at]`: 이상 행위 탐지

**사용 사례:**
- 게스트 사용 추적
- Rate Limiting
- 이상 행위 탐지

### 2.2 ApiLog

**스키마:**
```prisma
model ApiLog {
  id          String   @id @default(uuid())
  user_id     String?
  method      String?
  endpoint    String?
  status_code Int?
  latency_ms  Int?
  created_at  DateTime @default(now())
}
```

**인덱스:**
- `[user_id, created_at]`: 사용자별 API 로그
- `[method, endpoint, created_at]`: 엔드포인트별 로그
- `[status_code, created_at]`: 에러율 분석
- `[latency_ms]`: 성능 분석

**사용 사례:**
- API 성능 모니터링
- 에러율 추적
- 사용자별 API 사용량

### 2.3 ErrorLog

**스키마:**
```prisma
model ErrorLog {
  id         String         @id @default(uuid())
  severity   ErrorSeverity?
  message    String?
  stack      String?
  service    String?
  ref_table  String?
  ref_id     String?
  extra      Json?
  created_at DateTime       @default(now())
}
```

**심각도:**
- `info`: 정보
- `warn`: 경고
- `error`: 에러
- `fatal`: 치명적

**인덱스:**
- `[service, created_at]`: 서비스별 에러
- `[severity, created_at]`: 심각도별 에러
- `[extra]` (GIN): JSON 필드 검색

**사용 사례:**
- 에러 추적
- 서비스별 에러 분석
- 심각도별 필터링

### 2.4 AuditLog

**구현 위치:** `app/lib/admin-audit-log.ts`

**목적:**
- 관리자 활동 추적
- 보안 감사
- 책임 추적

**현재 구현:**
- `ApiLog` 테이블 활용
- `method: 'ADMIN_ACTION'`
- `endpoint: action`

**향후:**
- 별도 `AdminAuditLog` 테이블 생성 가능

---

## 3. 로깅 함수

### 3.1 관리자 활동 로깅

**구현 위치:** `app/lib/admin-audit-log.ts`

**함수:**
- `logAdminAction(input)`: 일반 관리자 활동
- `logAdminSearch(...)`: 검색 활동
- `logAdminView(...)`: 조회 활동

**입력:**
```typescript
interface AdminAuditLogInput {
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
```

### 3.2 에러 로깅

**패턴:**
```typescript
try {
  // 작업 수행
} catch (error) {
  await prisma.errorLog.create({
    data: {
      severity: 'error',
      message: error.message,
      stack: error.stack,
      service: 'diary-analysis',
      // ...
    }
  });
}
```

---

## 4. 모니터링 API

### 4.1 성능 모니터링

**구현 위치:** `app/api/admin/monitoring/performance/route.ts`

**기능:**
- API 응답 시간 추적
- 느린 쿼리 감지
- 성능 메트릭 집계

### 4.2 에러 모니터링

**구현 위치:** `app/api/admin/monitoring/errors/route.ts`

**기능:**
- 에러 로그 조회
- 심각도별 필터링
- 서비스별 에러 분석

### 4.3 데이터베이스 통계

**구현 위치:** `app/lib/database-optimization.ts`

**함수:**
- `getDatabaseStats()`: 테이블별 레코드 수
- `analyzeQueryPerformance()`: 쿼리 성능 분석
- `cleanupOldData()`: 오래된 데이터 정리

---

## 5. 로그 정리

### 5.1 정기적 정리

**구현 위치:** `app/api/cron/cleanup-logs/route.ts`

**전략:**
- 30일 이상 로그 삭제
- 읽은 알림 7일 이상 삭제
- 자동 실행 (Cron)

**정리 대상:**
- LoginLog (30일 이상)
- ApiLog (30일 이상)
- ErrorLog (30일 이상)
- Notification (읽은 알림, 7일 이상)

### 5.2 수동 정리

**구현:** `cleanupOldData()`

**사용:**
- 관리자 대시보드
- 수동 실행 API

---

## 6. 알림 시스템

### 6.1 Notification 모델

**스키마:**
```prisma
model Notification {
  id              String            @id @default(uuid())
  user_id         String?
  type            NotificationType?
  title           String?
  message         String?
  read            Boolean           @default(false)
  visible_from    DateTime?
  visible_to      DateTime?
  announcement_id String?
  event_id        String?
  created_at      DateTime          @default(now())
}
```

**타입:**
- `notice`: 공지
- `system`: 시스템 알림
- `event`: 이벤트

**인덱스:**
- `[user_id, created_at]`: 사용자별 알림
- `[user_id, read, created_at]`: 읽지 않은 알림
- `[visible_from, visible_to]`: 표시 기간

### 6.2 알림 API

**주요 엔드포인트:**
- `GET /api/notifications`: 알림 목록
- `GET /api/notifications/[id]`: 알림 상세
- `PUT /api/notifications/[id]`: 알림 읽음 처리
- `POST /api/notifications/mark-all-read`: 전체 읽음 처리

---

## 7. 구현 상세

### 7.1 주요 함수

**로깅:**
- `logAdminAction(input)`: 관리자 활동 로깅
- `logAdminSearch(...)`: 검색 활동 로깅
- `logAdminView(...)`: 조회 활동 로깅

**모니터링:**
- `getDatabaseStats()`: 데이터베이스 통계
- `analyzeQueryPerformance()`: 쿼리 성능 분석
- `cleanupOldData()`: 오래된 데이터 정리

**최적화:**
- `createOptimizedIndexes()`: 인덱스 생성

### 7.2 로그 쿼리 패턴

**사용자별 로그:**
```typescript
const logs = await prisma.loginLog.findMany({
  where: {
    user_id: userId,
    created_at: { gte: startDate }
  },
  orderBy: { created_at: 'desc' }
});
```

**에러 로그:**
```typescript
const errors = await prisma.errorLog.findMany({
  where: {
    severity: 'error',
    service: 'diary-analysis',
    created_at: { gte: startDate }
  },
  orderBy: { created_at: 'desc' }
});
```

---

## 8. 성능 고려사항

### 8.1 로그 인덱싱

**전략:**
- 시간 기반 인덱스
- 복합 인덱스
- GIN 인덱스 (JSON 필드)

### 8.2 로그 정리

**전략:**
- 정기적 자동 정리
- 배치 삭제
- 인덱스 유지

---

## 9. 보안 고려사항

### 9.1 개인정보 보호

**전략:**
- 로그에 개인정보 최소화
- IP 주소만 기록
- 상세 정보는 암호화

### 9.2 감사 추적

**전략:**
- 모든 관리자 활동 로깅
- IP 및 User-Agent 기록
- 변경 이력 추적

---

## 10. 참고 자료

### 관련 코드 파일
- `app/lib/admin-audit-log.ts`: 관리자 활동 로깅
- `app/lib/database-optimization.ts`: 데이터베이스 최적화
- `app/api/admin/monitoring/`: 모니터링 API
- `app/api/cron/cleanup-logs/`: 로그 정리

### 관련 문서
- [데이터 레이어](./DATA_LAYER.md)
- [캐싱 및 성능 최적화](./CACHING_AND_PERFORMANCE.md)

---

## 11. 향후 개선 계획

### 11.1 계획된 개선사항

1. **실시간 모니터링**
   - WebSocket을 통한 실시간 알림
   - 대시보드 실시간 업데이트

2. **로그 분석**
   - 머신러닝 기반 이상 탐지
   - 패턴 분석

3. **알림 개선**
   - 푸시 알림
   - 이메일 알림

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
