# Sum Diary 앱 내부 개발 문서

이 폴더는 `my-app` 앱의 내부 개발 문서를 포함합니다. 공개 문서는 [`apps/my-app/docs/`](../../../apps/my-app/docs/)에서 확인할 수 있습니다.

## 문서 구조

### 개발 이력
- [refactoring-summary.md](./refactoring-summary.md) - 리팩토링 요약
- [refactoring-history.md](./refactoring-history.md) - 리팩토링 이력
- [development-status.md](./development-status.md) - 개발 현황
- [devlogs/](./devlogs/) - 앱별 개발 로그

### 계획 문서
- [planning/](./planning/) - 개발 계획 문서
  - [COST_AND_QUOTA_SYSTEM.md](./planning/COST_AND_QUOTA_SYSTEM.md) - 비용 및 할당량 시스템
  - [DEVELOPMENT_ROADMAP.md](./planning/DEVELOPMENT_ROADMAP.md) - 개발 로드맵
  - [DATA_EXPORT_PLAN.md](./planning/DATA_EXPORT_PLAN.md) - 데이터 내보내기 계획
  - [SSE_IMPLEMENTATION_PLAN.md](./planning/SSE_IMPLEMENTATION_PLAN.md) - SSE 구현 계획
  - [FUTURE_SOFT_DELETE_IMPLEMENTATION.md](./planning/FUTURE_SOFT_DELETE_IMPLEMENTATION.md) - 소프트 삭제 구현
  - [archive/](./planning/archive/) - 아카이브된 계획 문서

### 내부 가이드
- [guides/](./guides/) - 내부 개발 가이드
  - AI 설정, 데이터베이스, 배포, 마이그레이션 등
  - [archive/](./guides/archive/) - 아카이브된 가이드

### 보안 문서
- [security/](./security/) - 보안 관련 문서
  - 악용 방지, 위기 감지, 암호화, 키 관리 등

### 패턴 문서
- [patterns/](./patterns/) - 개발 패턴 문서
  - 빌드 전략, 순환 의존성, 미들웨어 분석 등

### 분석 문서
- [analysis/](./analysis/) - 분석 문서
  - 베타 런치 개선사항, HUA 메트릭 분석 등

### 비용 관리
- [cost-management/](./cost-management/) - 비용 관리 시스템 문서
  - [cost-management-problems-summary.md](./cost-management/cost-management-problems-summary.md)
  - [cost-management-system-detailed.md](./cost-management/cost-management-system-detailed.md)
  - [cost-management-system-v2.md](./cost-management/cost-management-system-v2.md)

### 할당량 시스템
- [quota-system/](./quota-system/) - 할당량 시스템 문서
  - [quota-draft-analysis.md](./quota-system/quota-draft-analysis.md)
  - [quota-system-code-review.md](./quota-system/quota-system-code-review.md)
  - [quota-system-final.md](./quota-system/quota-system-final.md)

### 베타 관련
- [beta/](./beta/) - 베타 관련 문서
  - [beta-launch-improvements.md](./beta/beta-launch-improvements.md)
  - [beta-required-tables.md](./beta/beta-required-tables.md)
  - [beta-scope.md](./beta/beta-scope.md)

### 단계별 작업
- [phases/](./phases/) - 단계별 작업 문서
  - Phase 1-4 클린업 및 완료 요약

### 게스트 모드
- [guest-mode/](./guest-mode/) - 게스트 모드 관련 문서
  - [guest-id-and-migration.md](./guest-mode/guest-id-and-migration.md)
  - [guest-mode.md](./guest-mode/guest-mode.md)

### 문서화
- [documentation/](./documentation/) - 문서화 관련 문서
  - [documentation-cleanup-summary.md](./documentation/documentation-cleanup-summary.md)
  - [documentation-consolidation-plan.md](./documentation/documentation-consolidation-plan.md)
  - [documentation-update-self-review.md](./documentation/documentation-update-self-review.md)

### 기타
- [development-plan.md](./development-plan.md) - 개발 계획
- [admin-development-plan.md](./admin-development-plan.md) - 관리자 개발 계획
- [data-export-plan.md](./data-export-plan.md) - 데이터 내보내기 계획
- [sse-implementation-plan.md](./sse-implementation-plan.md) - SSE 구현 계획
- [future-soft-delete.md](./future-soft-delete.md) - 소프트 삭제 구현
- [codebase-cleanup-plan.md](./codebase-cleanup-plan.md) - 코드베이스 정리 계획
- [components-reorganization-plan.md](./components-reorganization-plan.md) - 컴포넌트 재구성 계획
- [prompt-token-cost-analysis.md](./prompt-token-cost-analysis.md) - 프롬프트 토큰 비용 분석
- [next-steps.md](./next-steps.md) - 다음 단계
- [task-251114-plan.md](./task-251114-plan.md) - 작업 계획
- [hua-metrics-analysis.md](./hua-metrics-analysis.md) - HUA 메트릭 분석
- [lazy-cleanup-pattern.md](./lazy-cleanup-pattern.md) - 지연 정리 패턴
- [offline-pwa.md](./offline-pwa.md) - 오프라인 및 PWA

## 공개 문서

공개 문서는 [`apps/my-app/docs/`](../../../apps/my-app/docs/)에서 확인할 수 있습니다:
- [README.md](../../../apps/my-app/docs/README.md) - 앱 개요
- [PROJECT_INTRODUCTION.md](../../../apps/my-app/docs/PROJECT_INTRODUCTION.md) - 프로젝트 소개
- [ARCHITECTURE_AND_FEATURES.md](../../../apps/my-app/docs/ARCHITECTURE_AND_FEATURES.md) - 아키텍처 및 기능
- [DATABASE_SCHEMA.md](../../../apps/my-app/docs/DATABASE_SCHEMA.md) - 데이터베이스 스키마
- [PERFORMANCE_OPTIMIZATION_GUIDE.md](../../../apps/my-app/docs/PERFORMANCE_OPTIMIZATION_GUIDE.md) - 성능 최적화 가이드
- [architecture/](../../../apps/my-app/docs/architecture/) - 아키텍처 상세 문서

---

**최종 업데이트**: 2025-12-22
