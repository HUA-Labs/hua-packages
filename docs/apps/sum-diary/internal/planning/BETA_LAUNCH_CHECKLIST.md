# my-app 베타 런칭 체크리스트

> 작성일: 2025-01-25
> 최종 업데이트: 2025-01-25
> 상태: P0 완료, P1 대기

---

## 현황 요약

### 잘 되어있는 것

| 항목 | 상태 | 비고 |
|------|------|------|
| 에러 핸들링 | ✅ | Error Boundary, Sentry 연동, API 에러 처리 |
| 로깅 | ✅ | DB 기반 에러/API/감사 로그 |
| Rate Limiting | ✅ | IP/사용자별 메모리 기반 제한 |
| Quota | ✅ | 등급별 일일/월간 제한 (일반 3/50, 프리미엄 20/500) |
| 문의/피드백 | ✅ | contact 페이지 완비 |
| 알림 시스템 | ✅ | CRUD 완전 구현 |
| 설정 페이지 | ✅ | 언어, 테마, 프로필, 보안 등 |
| 법적 페이지 | ✅ | Privacy, Terms, Security, Email Policy |
| 다국어 | ✅ | 한/영/일 지원 |
| 암호화 | ✅ | AES-256 일기 암호화 |
| 초대코드 | ✅ | 베타테스터/앰배서더 관리 |
| 헬스체크 | ✅ | `/api/health` 엔드포인트 |
| 비용 알림 | ✅ | 일일 비용 임계값 ($5/$10/$20) |
| AI 면책 조항 | ✅ | 이용약관에 명시 (KO/EN/JA) |

---

## 우선순위별 작업 목록

### P0: 필수 (런칭 전 반드시) - ✅ 완료

| # | 작업 | 상태 | 파일 |
|---|------|------|------|
| 1 | AI 면책 조항 추가 | ✅ | `terms-content.tsx`, `terms-content-en.tsx`, `terms-content-ja.tsx` |
| 2 | 헬스체크 엔드포인트 | ✅ | `app/api/health/route.ts` |
| 3 | 비용 알림 시스템 | ✅ | `app/lib/cost-alert.ts`, `app/api/admin/dashboard/route.ts` |
| 4 | 분석 결과 면책 배너 | ❌ 제외 | UX 우선, 약관으로 충분 |

#### 구현 상세

**1. AI 면책 조항 (이용약관 제10조)**
- 정확성 보장 불가
- 의료/심리 치료 대체 아님
- 위기 상황 시 전문가 상담 권고
- **데이터 미활용 보장**: 일기 원문/분석 결과 AI 학습에 미사용

**2. 헬스체크 (`/api/health`)**
```json
{
  "status": "healthy | degraded | unhealthy",
  "checks": {
    "database": { "status": "up", "latency": 5 },
    "memory": { "used": 128, "total": 256, "percentage": 50 }
  }
}
```

**3. 비용 알림 시스템**
- 임계값: $5 (warning), $10 (critical), $20 (emergency)
- 어드민 대시보드에 `costAlert`, `todayCost` 추가
- `checkCostAlert()`, `getTodayCost()` 함수 제공

---

### P1: 중요 (런칭 직후 1주 내) - 대기 중

| # | 작업 | 상태 | 설명 |
|---|------|------|------|
| 5 | 온보딩 플로우 | ⏳ | 첫 로그인 환영 모달, 기능 소개 |
| 6 | 공지사항 완성 | ⏳ | 데이터 연동, 중요 공지 팝업 |
| 7 | 어드민 모니터링 | ⏳ | 에러 로그 연동, 성능 차트 |

#### 구현 계획

**5. 온보딩 플로우**
- `app/components/onboarding/WelcomeModal.tsx`
- `app/hooks/useFirstVisit.ts`
- 주요 기능 3-4개 소개 → "시작하기" 버튼

**6. 공지사항 완성**
- `app/(app)/announcements/page.tsx` 데이터 연동
- 중요 공지 팝업 기능

**7. 어드민 모니터링**
- `app/(app)/admin/monitoring/` 에러 로그 연동
- 성능 지표 차트

---

### P2: 권장 (베타 기간 중) - 미착수

| # | 작업 | 설명 |
|---|------|------|
| 8 | Redis Rate Limiting | 메모리 → Redis 마이그레이션 |
| 9 | 피드백 수집 강화 | 분석 후 만족도 평가 |
| 10 | 성능 모니터링 강화 | API 응답 시간, 느린 쿼리 로깅 |

---

### P3: 나중에 (정식 런칭 전) - 미착수

| # | 작업 | 설명 |
|---|------|------|
| 11 | 백업/복구 전략 문서화 | DB 백업 주기, 복구 절차 |
| 12 | 부하 테스트 | 동시 접속자, AI API rate limit |
| 13 | 접근성(A11y) 개선 | 스크린 리더, 키보드 네비게이션 |

---

## 작업 순서

```
Week 0 (런칭 전): ✅ 완료
├── P0-1: AI 면책 조항 추가
├── P0-2: 헬스체크 엔드포인트
├── P0-3: 비용 알림 시스템
└── P0-4: 분석 결과 면책 배너 (제외됨)

Week 1 (런칭 직후): ⏳ 대기
├── P1-5: 온보딩 모달
├── P1-6: 공지사항 완성
└── P1-7: 어드민 모니터링

Week 2-4 (베타 기간):
├── P2-8: Redis Rate Limiting
├── P2-9: 피드백 수집
└── P2-10: 성능 모니터링
```

---

## 검증 방법

| 항목 | 검증 방법 |
|------|-----------|
| AI 면책 | `/terms` 페이지에서 제10조 확인 |
| 헬스체크 | `curl /api/health` 응답 확인 |
| 비용 알림 | 어드민 대시보드에서 `costAlert` 확인 |

---

## 파일 변경 목록

### P0 변경 파일
```
apps/my-app/
├── app/constants/terms-content.tsx          # AI 면책 조항 (제10조)
├── app/constants/terms-content-en.tsx       # 영문 번역
├── app/constants/terms-content-ja.tsx       # 일본어 번역
├── app/api/health/route.ts                  # 헬스체크 (신규)
├── app/lib/cost-alert.ts                    # 비용 알림 (신규)
└── app/api/admin/dashboard/route.ts         # 비용 경고 추가
```

---

## 다음 세션 가이드

### P1 시작 시
1. 이 문서 확인
2. 온보딩 먼저 → 공지사항 → 어드민 모니터링 순서
3. 각 작업 완료 후 이 문서 업데이트

### 주의사항
- 숨다 캐릭터 컨셉 유지 (따뜻하고 친근한 톤)
- 프라이버시 퍼스트 철학
- 면책 배너는 UX 해치므로 제외 (약관으로 충분)

---

**작성**: Claude Code
**태그**: #beta-launch #checklist #p0-done #p1-pending
