# 숨다이어리 개선점 및 개선방안

> 작성일: 2026-01-17 | 기준 코드/문서: 2026-01-17  
> 기준: 코드베이스, 문서, TODO/FIXME, 기존 계획서 분석

---

## 1. 요약

| 구분 | 내용 |
|------|------|
| **목적** | 개선점을 한곳에 정리하고, 검토 후 우선순위에 따라 진행 |
| **우선순위** | P0(필수) / P1(권장) / P2(여유) |
| **참조 문서** | [PRODUCTION_READINESS_CHECKLIST](../PRODUCTION_READINESS_CHECKLIST.md), [BETA_LAUNCH_IMPROVEMENTS](../analysis/BETA_LAUNCH_IMPROVEMENTS.md), [DEVELOPMENT_ROADMAP](./DEVELOPMENT_ROADMAP.md), [DESIGN_REFACTORING_PLAN](../DESIGN_REFACTORING_PLAN.md), [DATA_EXPORT_PLAN](./DATA_EXPORT_PLAN.md) |

**우선순위 매트릭스**

| 우선순위 | 해당 항목 | 비고 |
|----------|------------|------|
| **P0** | 2.1 session/user `as any` 정리, 3.1 일기 수정 데이터 로드, 5.2 AI 프로바이더 설정 버그, 7.1 Sentry, 8.1 보안·컴플라이언스(UserQuota·AuditLog 등) | 단기(1~2주) 대응 권장 |
| **P1** | 2.2~2.5 타입 정리, 4.1 DEBUG 로그, 5.1 게스트 사용량·가입 유도, 5.3 AI 분석 시간, 6 디자인 리팩터, 8.2(SystemHealth·AdminAlert 등) | 중기(1~2개월) |
| **P2** | 3.2 알림 설정, 8.3(GDPR·2FA 등), 9 _future-features 활성화, 6 Phase 3 | 장기 |

**단기/중기/장기 구분**은 §11 우선순위·로드맵에 체크리스트로 정리.

---

## 2. 코드·타입 품질

### 2.1 `(session?.user as any)?.id` / `session as any`

| 위치 | 비고 | 개선방안 |
|------|------|----------|
| `app/hooks/settings/useAISettings.ts` | 4곳 | `auth.d.ts` 확장 활용, `session?.user?.id`로 교체 |
| `app/components/profile/ProfileInfoSection.tsx` | 1곳 | 동일 |
| `app/diary/[id]/page.tsx` | 2곳 | 동일 |
| `app/components/layout/Header.tsx` | `session={session as any}` 3곳 | Session 타입 전달 시 `as any` 제거. 자식에서 기대하는 타입 정합 |
| `app/lib/auth-v5.ts` | `(session as any).accessToken` | `auth.d.ts`에 `accessToken` 있음. 확장 반영 후 제거 |

**참고**: [auth.d.ts](../../auth.d.ts)에 `Session.user.id`, `Session.accessToken` 확장 정의. `app/diary/write` 훅들은 이미 `session?.user?.id`로 수정됨.

**추정 공수**: 1~2시간 (auth.d.ts 확인·보완 포함)

---

### 2.2 `@ts-ignore`

| 위치 | 개선방안 |
|------|----------|
| `app/api/admin/crisis-alerts/route.ts` (2곳) | Prisma 스키마/`prisma generate` 결과 확인. `@ts-expect-error` + 사유 또는 타입 보강 |
| `app/api/admin/crisis-alerts/[id]/route.ts` (6곳) | 동일 |

**추정 공수**: 1시간 (Prisma 모델/관계 검토)

---

### 2.3 `(prisma as any).*` / Prisma 확장 모델

| 위치 | 모델 예시 | 개선방안 |
|------|-----------|----------|
| `app/api/announcements/route.ts` | `announcement` | Prisma schema에 `Announcement` 등 정의 여부 확인. 없으면 스키마 추가 후 `as any` 제거 |
| `app/api/admin/monitoring/performance/route.ts` | `apiLog` | 동일 |
| `app/_reference/dev-api/dev/db-status/route.ts` | `notification`, `announcement`, `event`, `userStatusLog`, `errorLog`, `contentModerationLog`, `apiLog` | 참조용. 정리 시 Prisma 타입 정합 |

**추정 공수**: 스키마 정합 후 30분

---

### 2.4 `decryptUser(user as any)` / `decryptDiary(... as any)`

| 위치 | 개선방안 |
|------|----------|
| `app/api/user/profile/route.ts`, `app/api/admin/*`, `app/api/admin/setup/route.ts`, `app/api/admin/diary/deleted/route.ts` 등 | `decryptUser` 인자를 `Prisma.User` 또는 `EncryptedUser` 등으로 명시. `decryptDiary`는 `Buffer \| Uint8Array` 등 명시 |

**추정 공수**: 1시간 (lib 시그니처 정리)

---

### 2.5 기타 `as any`

| 위치 | 용도 | 개선방안 |
|------|------|----------|
| `app/api/diary/create/route.ts` | `content_enc: encryptedContent as any` | Prisma `Bytes` 등 타입에 맞게 단언 또는 타입 보강 |
| `app/api/diary/[id]/route.ts` | `result.diary as any` (include 복합 타입) | `Prisma.DiaryEntryGetPayload<{ include: ... }>` 등으로 좁히거나, 공통 타입 추출 |
| `app/api/diary/analyze/stream/route.ts` | `diary`, `content_enc`, `raw_ai_response`, `(error as any)?.code` 등 | 가능한 부분은 구체 타입/타입 가드. 에러 객체는 `unknown` + narrow |
| `app/components/modal/SearchModal.tsx` | `initialSortBy as any` | `'newest' \| 'oldest' \| 'title'` 등 유니온 타입으로 교체 |
| `app/components/layout/BottomNavigation.tsx` | `name={item.icon as any}` | Icon name 타입에 맞게 정의 |

**추정 공수**: 2~3시간 (analyze/stream 비중 큼)

---

## 3. 미구현·미완성 기능

### 3.1 일기 수정 모드: 데이터 로드

| 항목 | 내용 |
|------|------|
| **위치** | [app/diary/write/page.tsx](../../app/diary/write/page.tsx) L137~150, `// TODO: 일기 데이터 로드 API 호출` |
| **현재** | `editDiaryId`·`isEditMode`가 있어도 본문/제목/날짜 미로드 |
| **개선방안** | `useEffect` when `editDiaryId && isEditMode` → `GET /api/diary/[id]` 호출 → `setTitle`, `setContent`, `setDiaryDate`, `setSelectedDate` 등 설정. `GET /api/diary/[id]`는 [app/api/diary/[id]/route.ts](../../app/api/diary/[id]/route.ts)에 존재 |
| **추정 공수** | 2~3시간 |

---

### 3.2 일반 설정: 알림

| 항목 | 내용 |
|------|------|
| **위치** | [app/settings/components/GeneralSettingsTab.tsx](../../app/settings/components/GeneralSettingsTab.tsx) L84, `{/* 알림 - TODO: 기능 구현 필요 */}` |
| **현재** | "준비중", 비활성 스위치 |
| **개선방안** | (1) User/UserSetting에 알림 on/off 저장. (2) 설정 API 추가. (3) GeneralSettingsTab에서 API 연동. 단기: "준비중" 유지하고 이 문서/이슈로만 추적 |
| **추정 공수** | 4~6시간 (스키마+API+UI) / 단기 0시간 |

---

## 4. 디버그·로깅

### 4.1 `[DEBUG]` 로그 과다

| 위치 | 규모 | 개선방안 |
|------|------|----------|
| [app/api/diary/analyze/stream/route.ts](../../app/api/diary/analyze/stream/route.ts) | 70곳 이상 (Controller, Gemini, 폴백 스트림) | `process.env.DEBUG_ANALYZE_STREAM === '1'` 일 때만 출력. 또는 `pino`/`winston` 레벨로 분리 |
| [app/api/user/settings/route.ts](../../app/api/user/settings/route.ts) | 6곳 | `NODE_ENV=development` 또는 `DEBUG=sum:settings` 일 때만 |
| [app/hooks/settings/useAISettings.ts](../../app/hooks/settings/useAISettings.ts) | 8곳 | 동일 |

**추정 공수**: 2시간 (공통 래퍼 또는 조건부 사용)

---

## 5. UX·기능

### 5.1 게스트 사용량·가입 유도

| 항목 | 내용 |
|------|------|
| **출처** | [DEVLOG_2026-01-17_GUEST_EXPERIENCE_AND_NEXT_PLANS](../../../../docs/devlogs/DEVLOG_2026-01-17_GUEST_EXPERIENCE_AND_NEXT_PLANS.md) |
| **개선방안** | (1) GuestBanner에 "3/3", "2/3" 등 레이트리밋 표시. (2) 도달 시 가입 유도 모달 |
| **추정 공수** | 2~3시간 |

---

### 5.2 AI 프로바이더 설정 버그

| 항목 | 내용 |
|------|------|
| **현상** | 사용자가 Gemini 선택해도 openai로 저장, 새로고침 후 유지 안 됨 |
| **출처** | [AI_PROVIDER_SETTINGS_FAILURE_ANALYSIS](../AI_PROVIDER_SETTINGS_FAILURE_ANALYSIS.md) |
| **개선방안** | `useRef`로 최신 선택값 추적, 저장 시 ref 기준 전송. 모달 열릴 때 서버 값으로 초기화하되 "선택 → 저장" 플로우 명확화. 문서 내 방안 2·3 참고 |
| **추정 공수** | 2~3시간 |

---

### 5.3 AI 분석 시간 (~16초)

| 항목 | 내용 |
|------|------|
| **출처** | DEVLOG_2026-01-17 |
| **개선방안** | (1) 시스템 프롬프트 토큰 축소 (현재 ~9000자). (2) 스트리밍·청크 처리 개선. (3) 모델/옵션 검토 |
| **추정 공수** | 4~8시간 (실험 포함) |

---

## 6. 디자인·일관성

### 6.1 이모지·그라데이션·globals

| 항목 | 내용 |
|------|------|
| **출처** | [DESIGN_REFACTORING_PLAN](../DESIGN_REFACTORING_PLAN.md) |
| **요약** | 이모지 51개 파일, `gradient`/`bg-gradient` 61개, `globals.css` 259줄 |
| **개선방안** | Phase 1: 이모지·불필요 그라데이션 제거. Phase 2: `@hua-labs/ui` Button/Card/Input/Modal 등 교체. Phase 3: Tailwind theme 토큰 정리. 세부는 DESIGN_REFACTORING_PLAN 참고 |

---

### 6.2 UI 패키지 통합

| 항목 | 내용 |
|------|------|
| **개선방안** | DESIGN_REFACTORING_PLAN 2.2: Button/Input/Card → Layout → Feedback → Overlay 순 |

---

## 7. 인프라·운영

### 7.1 Sentry

| 항목 | 내용 |
|------|------|
| **출처** | DEVLOG_2026-01-17 |
| **이슈** | `onRequestError` 미구현, `global-error.tsx` 부재, `sentry.client.config.ts` deprecated |
| **개선방안** | (1) `instrumentation.ts`에 `onRequestError` 추가. (2) `app/global-error.tsx` 생성. (3) `sentry.client.config.ts` → `instrumentation-client.ts` 마이그레이션. 다른 앱·Sentry 가이드 참고 |
| **추정 공수** | 1~2시간 |

---

### 7.2 Vercel 배포

| 항목 | 내용 |
|------|------|
| **이슈** | hua-official, hua-docs, my-app 동시 빌드로 예산 소모 |
| **현재** | 각 앱 `vercel-ignore-check.mjs`에서 `DEPLOY_ENABLED_DATE` 없으면 스킵. 점진 재개 시 env 설정 |
| **개선방안** | 필요 시 `DEPLOY_ENABLED_DATE`로 선택 배포. 문서화만 보완해도 됨 |

---

## 8. 보안·컴플라이언스 (기존 계획 연계)

아래는 [PRODUCTION_READINESS_CHECKLIST](../PRODUCTION_READINESS_CHECKLIST.md), [BETA_LAUNCH_IMPROVEMENTS](../analysis/BETA_LAUNCH_IMPROVEMENTS.md) 요약. 세부·스키마는 원문 참고.

### 8.1 P0 (필수)

- UserQuota, 비용 추적, BackupRecord, AuditLog, 인증/인가 보강

### 8.2 P1 (권장)

- SystemHealth, AdminAlert, AnalysisFailure 폴백, 세션 강화

### 8.3 P2

- GDPR(DataExport, AccountDeletion, UserConsent, ProcessingLog), 캐싱, 2FA 등

### 8.4 로드맵·관련 문서

- [DEVELOPMENT_ROADMAP](./DEVELOPMENT_ROADMAP.md): 데이터 내보내기, SSE(구현 완료), 어드민, Soft Delete 등
- [DATA_EXPORT_PLAN](./DATA_EXPORT_PLAN.md): 내보내기 형식·API·보안

---

## 9. 미활성 기능 (`_future-features`)

### 9.1 리포트 생성 API

| 항목 | 내용 |
|------|------|
| **위치** | [app/_future-features/api/reports/generate/route.ts](../../app/_future-features/api/reports/generate/route.ts) |
| **개선방안** | [app/_future-features/README.md](../../app/_future-features/README.md) 참고. `app/api/reports/`로 이전, 리포트 페이지 UI, 생성 버튼 연동. DEVELOPMENT_ROADMAP Phase 1과 정합 |
| **추정 공수** | 1~2일 |

---

### 9.2 키워드 추출 API

| 항목 | 내용 |
|------|------|
| **위치** | [app/_future-features/api/extract-keywords/route.ts](../../app/_future-features/api/extract-keywords/route.ts) |
| **개선방안** | `app/api/diary/extract-keywords/`로 이전, 일기 생성/수정 후 호출, 키워드 태그 UI·검색 |
| **추정 공수** | 1일 |

---

## 10. 기타

| 항목 | 내용 |
|------|------|
| **VPN 감지** | 현재 비활성(`return false`). 악용 패턴 시 재활성화 검토 (DEVLOG) |
| **localStorage `diary_draft`** | write/page에서 24시간 이내 복원. IndexedDB drafts와 역할 중복 검토(선택) |
| **에러 경계** | `app/error.tsx` 존재. `global-error.tsx`는 7.1 Sentry와 함께 추가 |

---

## 11. 우선순위·로드맵

### 11.1 단기 (1~2주, 검토 후 조정)

- [ ] **2.1** session/user `as any` 정리 (useAISettings, ProfileInfoSection, diary/[id], Header)
- [ ] **3.1** 일기 수정 모드 데이터 로드 (TODO 구현)
- [ ] **5.2** AI 프로바이더 설정 버그 (AI_PROVIDER_SETTINGS_FAILURE_ANALYSIS 반영)
- [ ] **7.1** Sentry: onRequestError, global-error, instrumentation-client

### 11.2 중기 (1~2개월)

- [ ] **2.2~2.5** @ts-ignore, prisma as any, decryptUser/decryptDiary, 기타 as any
- [ ] **4.1** DEBUG 로그 조건부/레벨 분리
- [ ] **5.1** 게스트 사용량·가입 유도
- [ ] **5.3** AI 분석 시간 단축 (프롬프트·스트리밍)
- [ ] **6** DESIGN_REFACTORING_PLAN Phase 1~2 (이모지·그라데이션·UI 교체)

### 11.3 장기

- [ ] **3.2** 알림 설정 (스키마+API+UI)
- [ ] **6** Phase 3 디자인 토큰
- [ ] **8** PRODUCTION_READINESS P0·P1
- [ ] **9** _future-features 활성화 (리포트, 키워드)

---

## 부록: 관련 문서

| 문서 | 경로 |
|------|------|
| PRODUCTION_READINESS_CHECKLIST | docs/PRODUCTION_READINESS_CHECKLIST.md |
| BETA_LAUNCH_IMPROVEMENTS | docs/analysis/BETA_LAUNCH_IMPROVEMENTS.md |
| DEVELOPMENT_ROADMAP | docs/planning/DEVELOPMENT_ROADMAP.md |
| DESIGN_REFACTORING_PLAN | docs/DESIGN_REFACTORING_PLAN.md |
| DATA_EXPORT_PLAN | docs/planning/DATA_EXPORT_PLAN.md |
| AI_PROVIDER_SETTINGS_FAILURE_ANALYSIS | docs/AI_PROVIDER_SETTINGS_FAILURE_ANALYSIS.md |
| DEVLOG_2026-01-17_GUEST_EXPERIENCE_AND_NEXT_PLANS | docs/devlogs/DEVLOG_2026-01-17_GUEST_EXPERIENCE_AND_NEXT_PLANS.md |
| _future-features README | app/_future-features/README.md |
| OFFLINE_SYNC_SYSTEM | docs/architecture/OFFLINE_SYNC_SYSTEM.md |
| PERFORMANCE_OPTIMIZATION_GUIDE | docs/PERFORMANCE_OPTIMIZATION_GUIDE.md |
