# 🚀 베타 런칭 전 개선사항 정리

> 작성일: 2025-12-06  
> 목적: 베타 런칭을 앞두고 개선해야 할 사항들을 우선순위별로 정리

---

## 🔴 P0 (Critical) - 베타 런칭 전 필수

### 1. 비용 관리 시스템 (악의적 사용자 대비)

**현재 상태**: ⚠️ 스키마는 있으나 구현 미완료

**필수 구현:**
- [ ] `UserQuota` API 구현
  - 일일/월간 일기 작성 제한 체크
  - 일일/월간 AI 분석 제한 체크
  - Redis 캐싱으로 실시간 체크 (DB 부하 최소화)
- [ ] `BillingRecord` 집계 로직
  - 사용자별 월간 비용 집계
  - 프로바이더별 비용 분석
  - 고액 사용자 탐지
- [ ] `AnalysisResult` 비용 추적 정밀화
  - `input_tokens`, `output_tokens` 저장 (이미 스키마에 있음)
  - `cost_usd` 계산 로직 추가
  - 프로바이더별 토큰 가격 설정

**예상 작업량**: 3-5일

**리스크**: 비용 폭탄 가능성 (악의적 사용자가 무제한 요청 시)

---

### 2. 데이터 보호 (백업 자동화)

**현재 상태**: ⚠️ 스키마는 있으나 자동화 미완료

**필수 구현:**
- [ ] `BackupRecord` 자동화 스크립트
  - 일일 전체 백업
  - 시간별 증분 백업
  - 백업 파일 무결성 검증 (checksum)
  - 만료된 백업 자동 정리
- [ ] 백업 복구 테스트 프로세스
  - 월 1회 복구 테스트
  - 복구 시간 측정

**예상 작업량**: 2-3일

**리스크**: 데이터 손실 시 복구 불가능

---

### 3. 보안 추적 (AuditLog)

**현재 상태**: ⚠️ 스키마는 있으나 구현 미완료

**필수 구현:**
- [ ] `AuditLog` 기록 로직
  - 관리자 민감 작업 기록 (복호화, 삭제, 수정)
  - 사용자 데이터 접근 기록
  - 변경 전후 값 저장 (변경 추적)
- [ ] 비동기 로깅 (성능 영향 최소화)
- [ ] 로그 조회 API (관리자용)

**예상 작업량**: 2-3일

**리스크**: 보안 사고 시 추적 불가능

---

### 4. 인증/인가 시스템 완성

**현재 상태**: ⚠️ TODO 주석 다수 발견

**필수 구현:**
- [ ] 사용자 인증 완성
  - 로그인/회원가입 완전 구현
  - 세션 관리 강화
  - JWT 또는 NextAuth 완전 통합
- [ ] 권한 확인 로직 추가
  - 모든 API에 사용자 권한 확인
  - 관리자 권한 확인 (`/admin/*` 경로)
  - 일기 소유권 확인 (`/api/diary/*`)
- [ ] TODO 주석 제거
  - `// TODO: 로그인 구현 후 사용자 권한 확인` → 실제 구현
  - `// TODO: 관리자 권한 확인` → 실제 구현

**예상 작업량**: 5-7일

**리스크**: 권한 없는 사용자가 다른 사용자 데이터 접근 가능

---

## 🟡 P1 (High) - 베타 런칭 전 권장

### 5. 모니터링 시스템

**현재 상태**: ⚠️ 스키마는 있으나 구현 미완료

**권장 구현:**
- [ ] `SystemHealth` 모니터링
  - API, DB, AI 프로바이더 헬스체크
  - 응답 시간 추적
  - 에러율 모니터링
- [ ] `AdminAlert` 알림 시스템
  - Slack/Discord 웹훅 연동
  - 중복 알림 방지
  - 심각도별 알림 분류

**예상 작업량**: 3-4일

**리스크**: 서비스 장애 시 즉시 대응 불가능

---

### 6. AI 장애 대응 (폴백 전략)

**현재 상태**: ⚠️ 스키마는 있으나 구현 미완료

**권장 구현:**
- [ ] `AnalysisFailure` 재시도 로직
  - Exponential Backoff
  - 프로바이더별 재시도 정책
- [ ] 폴백 전략
  - OpenAI 실패 → Gemini 시도
  - Gemini 실패 → HUA Engine 시도
  - 사용자에게 지연 알림

**예상 작업량**: 2-3일

**리스크**: AI 프로바이더 장애 시 서비스 중단

---

### 7. 세션 보안 강화

**현재 상태**: ⚠️ 부분 구현

**권장 구현:**
- [ ] 세션 메타데이터 추가
  - IP 주소 기록
  - User-Agent 기록
  - 디바이스 ID 기록
  - 마지막 활동 시간 추적
- [ ] 비정상 세션 탐지
  - 새 위치/디바이스 로그인 알림
  - 휴면 세션 자동 정리

**예상 작업량**: 2-3일

---

## 🟢 P2 (Medium) - 정식 런칭 전

### 8. GDPR 컴플라이언스 (유럽 사용자 있으면 P0)

**현재 상태**: ✅ 스키마 준비 완료, 구현 필요

**구현 필요:**
- [ ] `DataExportRequest` API
- [ ] `AccountDeletionRequest` API
- [ ] `UserConsent` 관리
- [ ] `PersonalDataProcessingLog` 기록

**예상 작업량**: 5-7일

**리스크**: 유럽 사용자 접근 시 법적 위반 (최대 매출의 4% 벌금)

---

### 9. 베타 범위 기능 완성

**현재 상태**: ⚠️ 부분 구현

**구현 필요:**
- [ ] 리포트 페이지
  - 리포트 생성 API 활성화 (`_future-features` → `api`)
  - 리포트 조회 페이지 UI
  - 리포트 데이터 표시
- [ ] 어드민 데이터 다운로드
  - 다운로드 요청 API
  - ZIP 파일 생성
  - `DecryptionLog` 기록

**예상 작업량**: 2주

---

## 📊 우선순위별 작업 계획

### Week 1-2: P0 필수 항목

**Day 1-3: 비용 관리**
- UserQuota API 구현
- BillingRecord 집계 로직
- 비용 추적 정밀화

**Day 4-5: 데이터 보호**
- BackupRecord 자동화
- 백업 복구 테스트

**Day 6-7: 보안 추적**
- AuditLog 기록 로직
- 비동기 로깅

**Day 8-14: 인증/인가**
- 사용자 인증 완성
- 권한 확인 로직
- TODO 주석 제거

---

### Week 3-4: P1 권장 항목

**Day 15-18: 모니터링**
- SystemHealth 구현
- AdminAlert 알림

**Day 19-21: AI 폴백**
- AnalysisFailure 재시도
- 폴백 전략

**Day 22-24: 세션 보안**
- 세션 메타데이터
- 비정상 탐지

---

## 🎯 최소 베타 런칭 기준

### 필수 완료 항목 (P0)
1. ✅ 비용 관리 (UserQuota, 비용 추적)
2. ✅ 데이터 보호 (BackupRecord 자동화)
3. ✅ 보안 추적 (AuditLog 기본 구현)
4. ✅ 인증/인가 (사용자 권한 확인)

### 권장 완료 항목 (P1)
1. ⚠️ 모니터링 (SystemHealth)
2. ⚠️ AI 폴백 (AnalysisFailure)

---

## 📝 체크리스트

### 비용 관리
- [ ] UserQuota 일일/월간 제한 체크
- [ ] Redis 캐싱으로 실시간 체크
- [ ] BillingRecord 월간 집계
- [ ] AnalysisResult 비용 추적

### 데이터 보호
- [ ] 일일 전체 백업 자동화
- [ ] 시간별 증분 백업
- [ ] 백업 복구 테스트 프로세스

### 보안 추적
- [ ] AuditLog 기록 로직
- [ ] 비동기 로깅
- [ ] 로그 조회 API

### 인증/인가
- [ ] 사용자 인증 완성
- [ ] 권한 확인 로직
- [ ] TODO 주석 제거

### 모니터링
- [ ] SystemHealth 헬스체크
- [ ] AdminAlert 알림

### AI 폴백
- [ ] AnalysisFailure 재시도
- [ ] 프로바이더 폴백

---

## 💡 즉시 시작 가능한 작업

### 1. 비용 관리 (가장 시급)
```typescript
// apps/my-app/app/api/diary/create/route.ts
// UserQuota 체크 추가
const quota = await checkUserQuota(userId);
if (!quota.canCreateDiary) {
  return new Response('일일 작성 제한 초과', { status: 429 });
}
```

### 2. 권한 확인 (보안)
```typescript
// 모든 API에 추가
const session = await getServerSession();
if (!session || session.user.id !== diary.user_id) {
  return new Response('권한 없음', { status: 403 });
}
```

### 3. AuditLog 기록
```typescript
// 민감 작업 시
await prisma.auditLog.create({
  data: {
    actor_id: adminId,
    actor_type: 'ADMIN',
    action: 'DECRYPT',
    resource: 'DiaryEntry',
    resource_id: diaryId,
    // ...
  }
});
```

---

## 🚨 리스크 매트릭스

| 항목 | 심각도 | 확률 | 현재 상태 | 우선순위 |
|------|--------|------|-----------|----------|
| 비용 폭탄 | 🔴 Critical | 중 | ⚠️ 미구현 | P0 |
| 데이터 손실 | 🔴 Critical | 낮 | ⚠️ 자동화 없음 | P0 |
| 권한 우회 | 🔴 Critical | 중 | ⚠️ TODO 주석 | P0 |
| 보안 추적 불가 | 🔴 Critical | 낮 | ⚠️ 미구현 | P0 |
| 서비스 장애 | 🟡 High | 중 | ⚠️ 모니터링 없음 | P1 |
| AI 장애 | 🟡 High | 중 | ⚠️ 폴백 없음 | P1 |

---

## 📅 예상 일정

**최소 베타 런칭 (P0만 완료)**: 2주  
**권장 베타 런칭 (P0+P1 완료)**: 4주  
**완전한 베타 런칭 (P0+P1+P2 완료)**: 6-8주

---

## 🎯 다음 액션 아이템

1. **오늘 바로 시작**: 비용 관리 시스템 (UserQuota)
2. **이번 주 내**: 인증/인가 완성
3. **다음 주**: 데이터 보호 + 보안 추적
4. **3주차**: 모니터링 + AI 폴백

---

**작성자**: Auto (AI Assistant)  
**태그**: #beta-launch #improvements #priority #security #cost-management

