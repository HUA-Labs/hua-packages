# Cursor Skills

이 폴더는 Cursor AI가 프로젝트 작업 시 참고할 수 있는 Agent Skills를 포함합니다.

## 스킬 목록

### 1. Create React Component
- **경로**: `create-component/SKILL.md`
- **용도**: HUA Platform 컨벤션에 맞는 React 컴포넌트 생성
- **사용 시점**: 새 컴포넌트를 만들 때

### 2. Use HUA UI SDK
- **경로**: `use-sdk/SKILL.md`
- **용도**: `@hua-labs/ui` SDK 컴포넌트 올바르게 사용
- **사용 시점**: UI 컴포넌트를 사용할 때

### 3. Monorepo Workflow
- **경로**: `monorepo-workflow/SKILL.md`
- **용도**: 모노레포에서 작업하는 방법
- **사용 시점**: 패키지나 앱을 작업할 때

### 4. Commit Convention
- **경로**: `commit-convention/SKILL.md`
- **용도**: 커밋 메시지 컨벤션 준수 (영어)
- **사용 시점**: 커밋할 때

### 5. Graphite Workflow Manager
- **경로**: `graphite-workflow/SKILL.md`
- **용도**: Graphite(gt CLI)를 사용한 Stacked Diff 방식 워크플로우
- **사용 시점**: 작업을 논리적 단위로 분리하여 커밋할 때

### 6. Git Flow Workflow ⚠️ DEPRECATED
- **경로**: `git-flow/SKILL.md`
- **용도**: ~~Git Flow 워크플로우 따르기~~ (더 이상 사용 안 함)
- **상태**: Deprecated - Trunk-Based Development로 전환됨
- **대체**: [Graphite Workflow Manager](#5-graphite-workflow-manager) 및 [Trunk-Based Development](#16-trunk-based-development) 사용

### 16. Trunk-Based Development
- **경로**: `trunk-based-development/SKILL.md`
- **용도**: Graphite와 Vercel을 사용한 트렁크 기반 개발 워크플로우
- **사용 시점**: 브랜치 생성 및 PR 관리할 때

### 7. Create Pull Request
- **경로**: `create-pull-request/SKILL.md`
- **용도**: Pull Request 생성 가이드
- **사용 시점**: PR을 생성할 때

### 8. Code Review
- **경로**: `code-review/SKILL.md`
- **용도**: 코드 리뷰 가이드라인
- **사용 시점**: 코드 리뷰를 할 때

### 9. Error Handling
- **경로**: `error-handling/SKILL.md`
- **용도**: 에러 처리 패턴 및 가이드
- **사용 시점**: 에러 처리를 구현할 때

### 10. Write Tests
- **경로**: `write-tests/SKILL.md`
- **용도**: Vitest를 사용한 테스트 작성 가이드
- **사용 시점**: 테스트를 작성할 때

### 11. Create API Route
- **경로**: `create-api-route/SKILL.md`
- **용도**: Next.js App Router API 라우트 생성 가이드
- **사용 시점**: API 라우트를 생성할 때

### 12. Define Types
- **경로**: `define-types/SKILL.md`
- **용도**: TypeScript 타입 정의 가이드
- **사용 시점**: 타입을 정의할 때

### 13. Write Devlog
- **경로**: `write-devlog/SKILL.md`
- **용도**: 매일 데브로그 작성 가이드
- **사용 시점**: 데브로그를 작성할 때

### 14. Write Debugging Log
- **경로**: `write-debugging-log/SKILL.md`
- **용도**: 디버깅 실패 로그 작성 가이드
- **사용 시점**: 디버깅 실패를 기록할 때

### 15. Document Patterns
- **경로**: `document-patterns/SKILL.md`
- **용도**: 중요한 패턴을 별도 문서에 기록하는 가이드
- **사용 시점**: 반복되는 패턴을 문서화할 때

## 스킬 구조

각 스킬은 다음 구조를 따릅니다:

```
skill-name/
└── SKILL.md          # 필수: 지시사항 및 메타데이터
```

## 사용 방법

1. 작업 시작 전 관련 스킬 확인
2. 스킬의 지시사항 따라 작업 수행
3. 스킬의 체크리스트 확인

## 스킬 추가

새 스킬을 추가하려면:

1. `.cursor/skills/{skill-name}/` 폴더 생성
2. `SKILL.md` 파일 생성 (YAML frontmatter + Markdown)
3. 이 README에 스킬 추가

## 참고

- [Agent Skills 공식 문서](https://agentskills.io/)
- [Agent Skills 스펙](https://agentskills.io/specification)
