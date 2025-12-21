# Graphite 도입 가이드

## 개요

이 폴더는 Graphite Hobby Plan 도입 및 활용을 위한 문서를 포함합니다. Graphite는 모노레포 환경에서 효율적인 코드 리뷰와 PR 관리를 위한 도구입니다.

## Graphite란?

Graphite는 Git 호환 버전 관리 시스템으로, 특히 모노레포 환경에서 다음과 같은 기능을 제공합니다:

- **Stacked Pull Requests**: 큰 변경을 작은 PR로 분리하여 독립적으로 리뷰 및 머지
- **Graphite CLI**: 복잡한 Git 작업을 간소화하는 명령줄 도구
- **Graphite Agent**: AI 기반 자동 코드 리뷰
- **Merge Queue**: 자동 머지 관리 및 충돌 해결

## Hobby Plan 특징

HUA 플랫폼에서는 **Hobby Plan (무료)**을 사용합니다:

### 포함 기능
- 개인 GitHub 저장소 지원
- CLI (Stacked PR, Git 명령어 간소화)
- Multi-Commit Pull Requests (MCP)
- VSCode 확장
- Graphite Agent 제한적 사용
  - AI 리뷰 제한적
  - AI 생성 PR 제목/설명
  - AI 채팅 제한적

### 제한사항
- Graphite Agent의 AI 리뷰가 제한적
- 일부 고급 기능 미사용

## 문서 구조

### 빠른 시작
1. **[설치 가이드](./SETUP_GUIDE.md)** - Graphite CLI 설치 및 GitHub 연동
2. **[워크플로우 가이드](./WORKFLOW_GUIDE.md)** - Stacked PRs 사용법 및 기본 명령어

### 상세 가이드
3. **[통합 전략](./INTEGRATION_STRATEGY.md)** - Cursor와의 통합 전략 및 단계별 계획
4. **[Agent 가이드](./AGENT_GUIDE.md)** - Graphite Agent 활용 방법 및 커스텀 규칙 설정

## AI와 함께 개발하는 전략

Graphite는 Cursor AI와 함께 사용하여 완전한 AI 개발 사이클을 구축합니다:

```
Cursor AI (코드 작성)
    ↓
Graphite Agent (자동 리뷰)
    ↓
Stacked PRs (단계별 검증)
    ↓
자동 머지
```

### 장점
- **품질 보장**: AI 리뷰로 실수 사전 방지
- **가이드라인 자동 준수**: 프로젝트 가이드라인을 커스텀 규칙으로 설정
- **시간 절약**: 수동 리뷰 시간 감소, 버그 조기 발견

## 현재 상태

- **도입 단계**: 문서화 완료 (2025-12-21)
- **다음 단계**: Graphite CLI 설치 및 테스트
- **통합 일정**: Cursor와의 통합은 2026년 내 점진적 진행 예정

## 관련 문서

- [패키지 개선 가이드라인](../PACKAGE_IMPROVEMENT_GUIDELINES.md) - Graphite Agent가 체크할 가이드라인
- [기여 가이드](../CONTRIBUTING.md) - 기존 Git 워크플로우
- [브랜치 보호 규칙](../GIT_BRANCH_PROTECTION.md) - 브랜치 전략

## 참고 링크

- [Graphite 공식 사이트](https://graphite.dev)
- [Graphite CLI 문서](https://docs.graphite.dev)
- [Graphite Agent 소개](https://www.graphite.com/guides/ai-coding-model-comparison)

---

**작성일**: 2025-12-21  
**태그**: #graphite #code-review #monorepo #ai-development
