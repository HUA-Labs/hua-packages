# 문서 통폐합 계획

> 작성일: 2025-12-16

## 현재 상황 (2025-12-16 업데이트)
- 총 **105개의 마크다운 파일**이 `apps/my-app/docs/` 폴더에 존재 (archive 포함)
- 루트 핵심 문서: **11개** (정리 완료)
- 중복 문서들은 `archive/` 폴더로 이동 완료
- 통합 문서 생성 완료 (SETUP_GUIDE, EMAIL_SETUP, BUILD_AND_DEPLOYMENT, DEVELOPMENT_ROADMAP, COST_AND_QUOTA_SYSTEM, REFACTORING_HISTORY)
- **모노레포 루트 `docs/` 폴더**에도 문서들이 있어 통합 필요 (향후 작업)

## 통폐합 전략

### 모노레포 루트로 이동할 문서

#### 1. DEVLOG 시리즈 → `docs/devlogs/` [완료]
**대상:**
- `DEVLOG_2025-12-08.md`
- `DEVLOG_2025-12-09.md`
- `DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md`
- `DEVLOG_2025-12-15_BUILD_FIXES_AND_PRISMA_7_MIGRATION.md`

**이유:** 모노레포 전체 개발 로그는 루트 `docs/devlogs/`에 통합 관리
**상태:** 완료 - 4개 파일 이동 완료

---

#### 2. BUILD/DEPLOYMENT 공통 문서 → `docs/patterns/` 또는 루트 [진행 중]
**대상:**
- `BUILD_FIX_ATTEMPTS_2025-12-15.md`
- `TURBO_PATH_FIX.md`
- `TURBOPACK_VS_WEBPACK_BUILD_ISSUES.md`
- `VERCEL_SERVERLESS_LEAK_FIXES.md`
- `DEPLOYMENT_WITH_PRIVATE_DB.md`

**이유:** 빌드/배포 관련 문서는 다른 앱에서도 참고 가능
**상태:** 진행 중 - `guides/` 폴더로 이동 완료, 모노레포 루트 이동은 미완료

---

#### 3. PRISMA 관련 → `docs/patterns/` 또는 유지 [진행 중]
**대상:**
- `PRISMA_BUILD_ENV_VARIABLES.md`
- `PRISMA_LAZY_INITIALIZATION_ANALYSIS.md`

**이유:** Prisma는 여러 앱에서 사용하므로 공통 패턴으로 관리
**상태:** 진행 중 - `guides/` 폴더로 이동 완료, 모노레포 루트 이동은 미완료

---

### my-app/docs 내부 정리

#### 1. PHASE 시리즈 통합 (10개 → 1개) [진행 중]
**대상:**
- `PHASE1_CLEANUP_SUMMARY.md`
- `PHASE2_CLEANUP_SUMMARY.md`
- `PHASE2_API_COMPARISON.md`
- `PHASE2_COMPLETE_SUMMARY.md`
- `PHASE2_FOLDER_STRUCTURE_ANALYSIS.md`
- `PHASE2_TEST_CLASSIFICATION.md`
- `PHASE3_COMPLETE_SUMMARY.md`
- `PHASE3_HEADER_REFACTORING.md`
- `PHASE4_CLEANUP_SUMMARY.md`
- `REFACTORING_SUMMARY.md`

**통합 후:** `history/REFACTORING_HISTORY.md`
- Phase별로 섹션 구분
- 주요 변경사항과 의사결정 요약
**상태:** 진행 중 - `history/` 폴더로 이동 완료, 통합 문서 생성 미완료

---

#### 2. SETUP/GUIDE 통합 (14개 → 4개) [완료]
**대상:**
- `AI_SETUP.md`
- `AI_PRICING_SETUP.md`
- `AI_PROVIDER_SETTINGS_FAILURE_ANALYSIS.md`
- `PROVIDER_SETTINGS_FLOW.md`
- `DOPPLER_TOKEN_SETUP.md`
- `ENVIRONMENT_VARIABLE_STRATEGY.md`
- `NODE_UPGRADE_GUIDE.md`
- `TIMEZONE_SETUP.md`
- `SUPABASE_MIGRATION.md`
- `UUID_V7_MIGRATION_STRATEGY.md`
- `GMAIL_WORKSPACE_EMAIL_SETUP.md`
- `EMAIL_SETUP_GUIDE.md`
- `EMAIL_ENV_SETUP.md`
- `AWS_SES_EMAIL_VERIFICATION_TROUBLESHOOTING.md`

**통합 후:**
- `guides/SETUP_GUIDE.md` - 초기 설정 가이드 (완료)
- `guides/MIGRATION_GUIDES.md` - 마이그레이션 가이드 (완료)
- `guides/EMAIL_SETUP.md` - 이메일 설정 통합 (완료)
- `guides/BUILD_AND_DEPLOYMENT.md` - 빌드 및 배포 가이드 (완료)
**상태:** 완료 - 통합 문서 생성 완료

---

#### 3. COST/QUOTA 통합 (7개 → 1개) [완료]
**대상:**
- `COST_MANAGEMENT_PROBLEMS_SUMMARY.md`
- `COST_MANAGEMENT_SYSTEM_DETAILED.md`
- `COST_MANAGEMENT_SYSTEM_V2.md`
- `PROMPT_TOKEN_COST_ANALYSIS.md`
- `QUOTA_DRAFT_ANALYSIS.md`
- `QUOTA_SYSTEM_CODE_REVIEW.md`
- `QUOTA_SYSTEM_FINAL.md`

**통합 후:** `planning/COST_AND_QUOTA_SYSTEM.md`
- 비용 관리 시스템 설명
- 할당량 시스템 설명
- 최신 버전 기준으로 정리
**상태:** 완료 - 통합 문서 생성 완료

---

#### 4. SCHEMA/DATABASE 통합 (6개 → 1개) [진행 중]
**대상:**
- `DATABASE_SCHEMA.md` (유지)
- `SCHEMA_IMPROVEMENT_DECISIONS.md`
- `SCHEMA_QUERY_OPTIMIZATION.md`
- `TABLE_CONSOLIDATION_ANALYSIS.md`
- `BETA_REQUIRED_TABLES.md`
- `숨다_db_스키마_v_0.3 — 22 테이블까지 필드 설명.md`

**통합 후:** `DATABASE_SCHEMA.md` (기존 파일 확장)
- 스키마 설명 + 개선 결정사항 + 최적화 가이드 통합
**상태:** 진행 중 - 관련 문서 `guides/` 폴더로 이동 완료, 통합 미완료

---

#### 5. PLANNING 문서 통합 (9개 → 1개) [완료]
**대상:**
- `DEVELOPMENT_PLAN.md`
- `ADMIN_DEVELOPMENT_PLAN.md`
- `CODEBASE_CLEANUP_PLAN.md`
- `COMPONENTS_REORGANIZATION_PLAN.md`
- `DATA_EXPORT_PLAN.md`
- `SSE_IMPLEMENTATION_PLAN.md`
- `FUTURE_SOFT_DELETE_IMPLEMENTATION.md`
- `NEXT_STEPS_2025-12-06.md`
- `TASK_251114_PLAN.md`

**통합 후:** `planning/DEVELOPMENT_ROADMAP.md`
- 완료된 계획은 제거
- 진행 중/예정 계획만 유지
- 우선순위별로 정리
**상태:** 완료 - 통합 문서 생성 완료

---

#### 6. ANALYSIS 문서 정리 (4개 → 2개) [완료]
**대상:**
- `HUA_METRICS_ANALYSIS.md`
- `LAZY_CLEANUP_PATTERN_ANALYSIS.md`
- `BETA_LAUNCH_IMPROVEMENTS.md`
- `BETA_SCOPE.md`

**통합 후:**
- `analysis/HUA_METRICS_ANALYSIS.md` (유지)
- `analysis/BETA_LAUNCH_SUMMARY.md` (BETA 관련 통합)
**상태:** 완료 - `analysis/` 폴더로 이동 완료

---

#### 7. patterns 폴더 정리 [대기]
**대상:** `docs/patterns/` 폴더 내 문서들

**통합 후:** `guides/TROUBLESHOOTING_GUIDE.md`
- 문제 해결 패턴들을 하나의 가이드로 통합
- 또는 모노레포 루트 `docs/patterns/`로 이동
**상태:** 대기

---

### 8. 보안/프라이버시 문서 (유지) [완료]
**유지할 문서:**
- `ABUSE_PREVENTION_GUIDE.md`
- `ABUSE_VS_CRISIS_COMPARISON.md`
- `ANONYMIZATION_GUIDELINES.md`
- `CRISIS_DETECTION.md`
- `KEY_MANAGEMENT_GUIDE.md`
- `PRIVACY_CONSTRAINTS_CRISIS.md`
- `SECURITY_IMPROVEMENTS.md`

**위치:** `security/` 폴더로 이동
**이유:** 핵심 보안 문서이므로 별도 유지
**상태:** 완료 - `security/` 폴더로 이동 완료

---

### 9. 핵심 아키텍처 문서 (루트에 유지) [완료]
**유지할 문서 (docs/ 루트):**
- `README.md` (업데이트 필요)
- `PROJECT_INTRODUCTION.md`
- `ARCHITECTURE_AND_FEATURES.md`
- `DATABASE_SCHEMA.md` (확장)
- `DEVELOPMENT_STATUS.md`
- `PERFORMANCE_OPTIMIZATION_GUIDE.md`
- `OFFLINE_AND_PWA.md`
- `GUEST_MODE.md`
- `GUEST_ID_AND_MIGRATION.md`

**이유:** 핵심 기능 설명 문서, 자주 참조됨
**상태:** 완료 - 루트에 유지

---

## 통합 후 예상 구조

### 모노레포 루트 `docs/`
```
docs/
├── devlogs/
│   ├── DEVLOG_2025-12-08.md (my-app에서 이동)
│   ├── DEVLOG_2025-12-09.md (my-app에서 이동)
│   ├── DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md (my-app에서 이동)
│   └── DEVLOG_2025-12-15_BUILD_FIXES_AND_PRISMA_7_MIGRATION.md (my-app에서 이동)
│
└── patterns/
    ├── build-errors.md (확장)
    ├── prisma-setup.md (새로 생성, Prisma 관련 통합)
    └── deployment.md (확장)
```

### my-app `docs/` (2025-12-16 최종 구조)
```
apps/my-app/docs/
├── README.md (업데이트 완료)
├── PROJECT_INTRODUCTION.md
├── ARCHITECTURE_AND_FEATURES.md
├── DATABASE_SCHEMA.md (재작성 완료 - 실제 사용 모델 중심)
├── DEVELOPMENT_STATUS.md
├── PERFORMANCE_OPTIMIZATION_GUIDE.md
├── OFFLINE_AND_PWA.md
├── GUEST_MODE.md
├── GUEST_ID_AND_MIGRATION.md
├── DOCUMENTATION_CONSOLIDATION_PLAN.md
│
├── architecture/ (15개 아키텍처 문서)
│   ├── ARCHITECTURE_OVERVIEW.md (메인 아키텍처 문서)
│   ├── DATA_LAYER.md
│   ├── ENCRYPTION_SYSTEM.md
│   ├── AI_ANALYSIS_SYSTEM.md
│   ├── CRISIS_DETECTION_SYSTEM.md
│   ├── ABUSE_DETECTION_SYSTEM.md
│   ├── AUTH_AND_AUTHORIZATION.md
│   ├── QUOTA_AND_BILLING_SYSTEM.md
│   ├── GUEST_MODE_SYSTEM.md
│   ├── OFFLINE_SYNC_SYSTEM.md
│   ├── API_LAYER.md
│   ├── FRONTEND_ARCHITECTURE.md
│   ├── SERVICE_LAYER.md
│   ├── CACHING_AND_PERFORMANCE.md
│   └── MONITORING_AND_LOGGING.md
│
├── guides/ (통합 문서 + 상세 가이드)
│   ├── SETUP_GUIDE.md (통합)
│   ├── MIGRATION_GUIDES.md (통합)
│   ├── EMAIL_SETUP.md (통합)
│   ├── BUILD_AND_DEPLOYMENT.md (통합)
│   ├── AI_SETUP.md
│   ├── AI_PRICING_SETUP.md
│   ├── PRISMA_BUILD_ENV_VARIABLES.md
│   ├── PRISMA_LAZY_INITIALIZATION_ANALYSIS.md
│   ├── PRODUCTION_READINESS_CHECKLIST.md
│   └── archive/ (중복 문서 보관)
│
├── security/ (8개 보안 문서)
│   ├── CRISIS_DETECTION.md
│   ├── ABUSE_PREVENTION_GUIDE.md
│   ├── KEY_MANAGEMENT_GUIDE.md
│   └── ...
│
├── planning/ (활성 계획 문서)
│   ├── DEVELOPMENT_ROADMAP.md (통합)
│   ├── COST_AND_QUOTA_SYSTEM.md (통합)
│   ├── DATA_EXPORT_PLAN.md
│   ├── SSE_IMPLEMENTATION_PLAN.md
│   ├── FUTURE_SOFT_DELETE_IMPLEMENTATION.md
│   └── archive/ (완료된 계획 문서 보관)
│
├── history/ (변경 이력)
│   ├── REFACTORING_HISTORY.md (통합)
│   └── archive/ (Phase별 상세 문서 보관)
│
├── analysis/ (4개 분석 문서)
│   ├── HUA_METRICS_ANALYSIS.md
│   ├── BETA_LAUNCH_IMPROVEMENTS.md
│   ├── BETA_SCOPE.md
│   └── LAZY_CLEANUP_PATTERN_ANALYSIS.md
│
└── patterns/ (문제 해결 패턴)
    ├── README.md
    ├── BUILD_STRATEGY_UNIFICATION.md
    └── ... (빌드/배포 문제 해결 패턴)
```

---

## 실행 계획 및 진행 상황

### 완료된 작업
1. **모노레포 루트로 이동**
   - [x] DEVLOG 시리즈 → `docs/devlogs/` (4개 파일 이동 완료)

2. **my-app/docs 내부 정리**
   - [x] 하위 폴더 생성 (guides, security, planning, history, analysis)
   - [x] 문서 카테고리별 이동 완료
     - [x] 보안 문서 → `security/` (8개)
     - [x] 분석 문서 → `analysis/` (4개)
     - [x] 계획 문서 → `planning/` (16개)
     - [x] PHASE 문서 → `history/` (10개)
     - [x] 설정/가이드 문서 → `guides/` (25개)

3. **README 업데이트**
   - [x] my-app `docs/README.md` 업데이트 완료

4. **통합 문서 생성**
   - [x] PHASE 시리즈 → `history/REFACTORING_HISTORY.md` (완료)
   - [x] SETUP/GUIDE → `guides/SETUP_GUIDE.md`, `guides/MIGRATION_GUIDES.md`, `guides/EMAIL_SETUP.md`, `guides/BUILD_AND_DEPLOYMENT.md` (완료)
   - [x] COST/QUOTA → `planning/COST_AND_QUOTA_SYSTEM.md` (완료)
   - [x] PLANNING → `planning/DEVELOPMENT_ROADMAP.md` (완료)

### 완료된 추가 작업 (2025-12-16)
1. **문서 정리**
   - [x] 완료된 계획 문서 archive로 이동
     - `ARCHITECTURE_DOCUMENTATION_PLAN.md` → `history/archive/`
     - 오래된 스키마 문서 → `history/archive/`
   - [x] planning/ 폴더 중복 문서 archive로 이동
     - COST/QUOTA 관련 문서 7개 → `planning/archive/`
     - 완료된 계획 문서 6개 → `planning/archive/`
   - [x] history/ 폴더 중복 문서 archive로 이동
     - PHASE 문서 10개 → `history/archive/`
   - [x] guides/ 폴더 중복 문서 archive로 이동
     - 스키마 관련 문서 4개 → `guides/archive/`
     - 이메일 중복 문서 4개 → `guides/archive/`
     - 빌드/배포 중복 문서 5개 → `guides/archive/`

2. **통합 문서 링크 수정**
   - [x] `EMAIL_SETUP.md` - archive 문서 참조 링크 수정
   - [x] `BUILD_AND_DEPLOYMENT.md` - archive 문서 참조 링크 수정
   - [x] `DEVELOPMENT_ROADMAP.md` - archive 문서 참조 링크 수정
   - [x] `SETUP_GUIDE.md` - archive 문서 참조 링크 수정
   - [x] `README.md` - history 폴더 설명 업데이트

3. **스키마 문서 재작성**
   - [x] `DATABASE_SCHEMA.md` - 실제 사용 모델 중심으로 재작성
   - [x] 향후 사용 예정 모델 별도 섹션으로 분리

### 대기 중인 작업
1. **patterns 폴더 정리**
   - [ ] 문제 해결 패턴 통합 가이드 생성 검토
   - [ ] 모노레포 루트 `docs/patterns/`로 이동 검토

2. **모노레포 루트 문서 업데이트**
   - [ ] 모노레포 루트 `docs/README.md` 업데이트 (my-app 문서 구조 반영)

---

## 주의사항

- 통합 전에 모든 문서 내용 검토 필요
- 중요한 정보가 누락되지 않도록 주의
- Git 히스토리를 통해 원본 문서 복구 가능하도록 보장
- 모노레포 루트로 이동한 문서는 다른 앱에서도 참고 가능하도록 명확한 제목 사용
