# 문서 정리 계획

**작성일**: 2025-12-06  
**목적**: 중구난방으로 쌓인 문서들을 체계적으로 정리하고 통합/아카이브

---

## 1. 통합 가능한 문서 그룹

### 1.1 UI 패키지 관련 문서 (통합 권장)

**현재 상태**: 여러 문서에 분산되어 있음

**통합 대상**:
- `HUA_UI_DEVELOPMENT_PLAN.md`
- `HUA_UI_PACKAGE_IMPROVEMENT_PROPOSAL.md`
- `HUA_UI_CORE_ADVANCED_SEPARATION_STRATEGY.md`
- `UI_PACKAGE_SERVER_CLIENT_SEPARATION.md`
- `packages/hua-ui/docs/IMPROVEMENTS_2025-12-05.md`
- `packages/hua-ui/docs/IMPROVEMENTS_2025-12-06.md`
- `packages/hua-ui/docs/COMPONENT_AUDIT.md`
- `packages/hua-ui/docs/REFACTORING_PLAN.md`
- `packages/hua-ui/docs/REFACTORING_IMPLEMENTATION.md`
- `packages/hua-ui/docs/REFACTORING_DETAILED.md`
- `packages/hua-ui/docs/REFACTORING_COMPLETE.md`

**통합 제안**:
- `packages/hua-ui/docs/HISTORY.md` - 과거 개선 이력 통합
- `packages/hua-ui/docs/IMPROVEMENTS.md` - 현재/미래 개선 계획 통합
- 나머지는 `packages/hua-ui/README.md`에 링크로 통합

---

### 1.2 Icon 시스템 관련 문서 (통합 권장)

**현재 상태**: 8개 이상의 문서로 분산

**통합 대상**:
- `packages/hua-ui/docs/ICON_SYSTEM.md` (메인 문서로 유지)
- `packages/hua-ui/docs/ICON_USAGE_GUIDE.md`
- `packages/hua-ui/docs/ICON_OPTIMIZATION_PLAN.md`
- `packages/hua-ui/docs/ICON_IMPROVEMENT_ROADMAP.md`
- `packages/hua-ui/docs/ICON_CORE_LIST.md`
- `packages/hua-ui/docs/ICON_BUNDLE_OPTIMIZATION_STRATEGY.md`
- `packages/hua-ui/docs/ICON_BUNDLE_OPTIMIZATION.md`
- `packages/hua-ui/docs/ICON_AUTOCOMPLETE.md`
- `packages/hua-ui/README_ICONS.md`

**통합 제안**:
- `packages/hua-ui/docs/ICON_SYSTEM.md` - 메인 문서로 통합 (이미 존재)
- 나머지 내용을 섹션으로 통합하거나 삭제
- `README_ICONS.md`는 `ICON_SYSTEM.md`로 리다이렉트

---

### 1.3 Motion 패키지 관련 문서 (통합 권장)

**현재 상태**: 리팩토링 관련 문서 다수

**통합 대상**:
- `packages/hua-motion/REFACTORING_SUMMARY.md`
- `packages/hua-motion/REFACTORING_STRATEGY.md`
- `packages/hua-motion/REFACTORING_COMPLETE.md`
- `packages/hua-motion/MOTION_REFACTORING_PLAN.md`
- `packages/hua-motion/CURRENT_STATUS.md`
- `packages/hua-motion/IMPACT_ANALYSIS.md`
- `packages/hua-motion/RECOMMENDED_APPROACH.md`
- `packages/hua-motion/DOCUMENTATION_INDEX.md`

**통합 제안**:
- `packages/hua-motion/REFACTORING_HISTORY.md` - 리팩토링 이력 통합
- `packages/hua-motion/README.md` - 현재 상태 및 사용법 (메인 문서)
- 나머지는 아카이브 또는 삭제

---

### 1.4 I18N 관련 문서 (인덱스 존재, 일부 통합 가능)

**현재 상태**: 인덱스는 있지만 일부 문서는 통합 가능

**통합 대상**:
- `I18N_CORE_DEVELOPMENT_PLAN.md`
- `I18N_CORE_ANALYSIS_AND_DEVELOPMENT.md`
- `I18N_CORE_PROGRESS.md`

**통합 제안**:
- `I18N_CORE_DEVELOPMENT_HISTORY.md` - 개발 이력 통합
- `I18N_CORE_INDEX.md`는 유지 (인덱스 역할)

---

### 1.5 Devlog 중복 (통합 권장)

**현재 상태**: 같은 주제의 devlog가 여러 개

**통합 대상**:
- `devlogs/DEVLOG_2025-12-05_UI_PACKAGE_IMPROVEMENT.md`
- `devlogs/DEVLOG_2025-12-06_UI_PACKAGE_IMPROVEMENT.md`

**통합 제안**:
- 하나의 devlog로 통합하거나, 날짜별로 명확히 구분
- 또는 `devlogs/UI_PACKAGE_IMPROVEMENT_2025-12.md`로 통합

---

## 2. 아카이브 대상 문서

### 2.1 오래된 Devlog (2025-07, 2025-08)

**아카이브 대상**:
- `devlogs/DEVLOG_2025-07-21_INITIAL_SETUP.md`
- `devlogs/DEVLOG_2025-07-22_ANIMATION_AND_UI_SITES.md`
- `devlogs/DEVLOG_2025-07-22_DEVELOPMENT_ROADMAP.md`
- `devlogs/DEVLOG_2025-07-23_REACT_19_JSX_TYPE_COMPATIBILITY.md`
- `devlogs/DEVLOG_2025-07-23_REACT_19_JSX_TYPE_COMPATIBILITY_EN.md`
- `devlogs/DEVLOG_2025-08-02_PAGE_LEVEL_ANIMATION_DEBUGGING.md`
- `devlogs/DEVLOG_2025-08-03_ADVANCED_COMPONENT_STRATEGY.md`
- `devlogs/DEVLOG_2025-08-03_DOCS_PAGE_ENHANCEMENT_AND_SDK_EVALUATION.md`
- `devlogs/DEVLOG_2025-08-03_MASTER_STRATEGY_SUMMARY.md`
- `devlogs/DEVLOG_2025-08-03_PERFORMANCE_ANALYSIS_AND_OPTIMIZATION.md`
- `devlogs/DEVLOG_2025-08-03_STORYBOOK_AND_DEVELOPMENT_TOOLS.md`
- `devlogs/DEVLOG_2025-08-12_MOTION_CORE_INTEGRATION_TEST_AND_AUTOMATED_DEPLOYMENT.md`

**아카이브 제안**:
- `docs/archive/devlogs/2025-07/` 폴더로 이동
- `docs/archive/devlogs/2025-08/` 폴더로 이동
- `docs/devlogs/README.md`에 아카이브 위치 명시

---

### 2.2 완료된 작업 관련 문서

**아카이브 대상**:
- `PRE_PUBLIC_MIGRATION_CHECKLIST.md` (완료됨)
- `PRE_PUBLIC_MIGRATION_SUMMARY.md` (완료됨)
- `PENDING_TASKS_AFTER_FEEDBACK.md` (완료된 작업들)
- `FINAL_CLEANUP_PLAN.md` (완료됨)
- `CLEANUP_OPTIONS.md` (완료됨)
- `BUILD_STATUS.md` (과거 상태)

**아카이브 제안**:
- `docs/archive/completed-tasks/` 폴더로 이동

---

### 2.3 중복/대체된 문서

**아카이브 대상**:
- `FRAMER_MOTION_REPLACEMENT_ROADMAP.md` (완료됨)
- `GRADUAL_MIGRATION_STRATEGY.md` (완료됨)
- `SDK_MIGRATION_GUIDE.md` (구버전)
- `VUE_MIGRATION_GUIDE.md` (사용 안 함)
- `VANILLA_JS_GUIDE.md` (사용 안 함)

**아카이브 제안**:
- `docs/archive/deprecated/` 폴더로 이동

---

### 2.4 일시적/임시 문서

**아카이브 대상**:
- `PR_TEMPLATE_FILLED.md` (예시 파일)
- `PR_DESCRIPTION.md` (임시 파일)
- `TASK_DIVISION_FOR_AGENTS.md` (임시 파일)
- `WORK_PLAN_2025.md` (과거 계획)

**아카이브 제안**:
- `docs/archive/temporary/` 폴더로 이동

---

## 3. 삭제 가능한 문서

### 3.1 중복된 내용

**삭제 대상**:
- `packages/hua-ui/docs/ICON_BUNDLE_OPTIMIZATION.md` (STRATEGY 버전으로 통합)
- `packages/hua-ui/docs/REFACTORING_DETAILED.md` (COMPLETE 버전으로 통합)

---

## 4. 정리 실행 계획

### Phase 1: 아카이브 폴더 생성 및 이동
1. `docs/archive/` 폴더 구조 생성
2. 오래된 devlog 이동
3. 완료된 작업 문서 이동
4. 중복/대체된 문서 이동

### Phase 2: 문서 통합
1. UI 패키지 문서 통합
2. Icon 시스템 문서 통합
3. Motion 패키지 문서 통합
4. Devlog 중복 해결

### Phase 3: 인덱스 업데이트
1. `docs/README.md` 업데이트
2. 각 패키지 README 업데이트
3. 아카이브 위치 문서화

---

## 5. 권장 폴더 구조

```
docs/
├── README.md (메인 인덱스)
├── patterns/ (패턴 문서 - 유지)
├── devlogs/ (최근 devlog만 - 유지)
├── templates/ (템플릿 - 유지)
├── archive/
│   ├── devlogs/
│   │   ├── 2025-07/
│   │   └── 2025-08/
│   ├── completed-tasks/
│   ├── deprecated/
│   └── temporary/
└── [핵심 문서들만 유지]
```

---

## 6. 다음 단계

1. 이 계획 검토 및 승인
2. 아카이브 폴더 생성
3. 문서 이동 및 통합 실행
4. 인덱스 업데이트

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-06

