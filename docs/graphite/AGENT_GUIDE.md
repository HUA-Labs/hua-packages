# Graphite Agent 가이드

## 개요

이 문서는 Graphite Agent를 활용한 AI 코드 리뷰 방법을 설명합니다. Graphite Agent는 PR을 자동으로 분석하고 피드백을 제공합니다.

## Graphite Agent란?

Graphite Agent (이전 이름: Diamond)는 AI 기반 코드 리뷰 도구입니다:

- **즉시 피드백**: PR 생성 직후 자동 리뷰
- **컨텍스트 인식**: 프로젝트 가이드라인 반영
- **버그 발견**: 타입 오류, 성능 이슈 등 사전 발견
- **가이드라인 준수**: 커스텀 규칙으로 프로젝트 표준 강제

## Hobby Plan에서의 제한사항

### 포함 기능
- 제한적 AI 리뷰
- AI 생성 PR 제목/설명
- 제한적 AI 채팅

### 제한사항
- AI 리뷰 횟수 제한
- 일부 고급 기능 미사용
- 무제한 리뷰는 유료 플랜 필요

## 기본 사용법

### 1. PR 생성 시 자동 리뷰

```bash
gt submit
```

PR을 제출하면 Graphite Agent가 자동으로 리뷰를 시작합니다.

### 2. 리뷰 결과 확인

GitHub PR 페이지에서 Graphite Agent의 리뷰를 확인할 수 있습니다:

1. PR 페이지로 이동
2. "Graphite Agent" 섹션 확인
3. 리뷰 피드백 검토

### 3. 리뷰 피드백 반영

리뷰 피드백을 받은 후:

```bash
# 피드백 반영
gt commit --amend -m "fix: address Graphite Agent feedback"
gt submit --update
```

## 커스텀 규칙 설정

### 프로젝트 가이드라인 반영

HUA 플랫폼의 가이드라인을 Graphite Agent 규칙으로 설정할 수 있습니다.

### 1. 패키지 레벨 완전성 원칙

**가이드라인**: [PACKAGE_IMPROVEMENT_GUIDELINES.md](../PACKAGE_IMPROVEMENT_GUIDELINES.md)

**규칙 예시**:
- 컴포넌트는 패키지 레벨에서 다크모드 지원 필수
- 반응형 스타일은 패키지 레벨에서 기본 제공
- 접근성 속성은 패키지 레벨에서 기본 제공

**Graphite Agent 체크**:
```
⚠️ 다크모드 클래스 누락
→ PACKAGE_IMPROVEMENT_GUIDELINES.md 참조
→ text-gray-900 dark:text-white 추가 필요
```

### 2. 스타일링 체계

**가이드라인**: 일관된 색상, 간격, 타이포그래피 체계

**규칙 예시**:
- 다크모드 색상: `text-gray-900 dark:text-white` (제목)
- 다크모드 색상: `text-gray-600 dark:text-gray-400` (설명)
- 테두리: `border-gray-100 dark:border-gray-700`

### 3. TypeScript 타입 안정성

**가이드라인**: 엄격한 타입 체크

**규칙 예시**:
- 모든 props에 명확한 타입 정의
- `any` 타입 사용 금지
- 타입 에러 없음

### 4. 접근성 속성

**가이드라인**: ARIA 속성 기본 제공

**규칙 예시**:
- 버튼에 `aria-label` 필수
- 폼 요소에 `aria-describedby` 권장
- 키보드 네비게이션 지원

## 실제 사용 예시

### 시나리오: 새 컴포넌트 개발

#### 1. Cursor AI로 코드 작성

```tsx
// Cursor가 생성한 코드
<SectionHeader title="제목" />
```

#### 2. Graphite Agent 자동 리뷰

```
⚠️ 다크모드 클래스 누락
→ PACKAGE_IMPROVEMENT_GUIDELINES.md 참조
→ text-gray-900 dark:text-white 추가 필요

⚠️ 접근성 속성 누락
→ aria-label 추가 권장
```

#### 3. Cursor AI로 수정

```tsx
// AI가 수정한 코드
<h3 
  className="text-base font-semibold text-gray-900 dark:text-white"
  aria-label="섹션 제목"
>
  {title}
</h3>
```

#### 4. Graphite Agent 재리뷰

```
✅ 다크모드 지원 확인
✅ 접근성 속성 확인
✅ 타입 안정성 확인
```

## 커스텀 규칙 설정 방법

### 방법 1: Graphite 웹 인터페이스

1. Graphite 웹사이트 로그인
2. Settings → Custom Rules
3. 프로젝트 가이드라인 추가

### 방법 2: 설정 파일 (향후 지원 예정)

```yaml
# .graphite/rules.yml (예시)
rules:
  - name: "Package-level completeness"
    check: "dark mode classes"
    message: "패키지 레벨에서 다크모드 지원 필수"
    reference: "docs/PACKAGE_IMPROVEMENT_GUIDELINES.md"
  
  - name: "Accessibility"
    check: "aria-label"
    message: "접근성 속성 추가 권장"
```

## Hobby Plan 최적화 전략

### 1. 중요한 PR에만 사용

제한된 AI 리뷰를 효율적으로 사용:

- 큰 기능 개발 PR
- 패키지 레벨 변경
- 아키텍처 변경

### 2. 핵심 규칙만 설정

모든 규칙을 설정하지 말고 핵심만:

- 패키지 레벨 완전성
- TypeScript 타입 안정성
- 접근성 기본 요구사항

### 3. 수동 리뷰와 병행

AI 리뷰만 의존하지 말고:

- AI 리뷰로 기본 체크
- 수동으로 세부 사항 확인
- 복잡한 로직은 직접 검토

## 효과 측정

### 리뷰 품질

- 발견된 버그 수
- 가이드라인 준수율
- 리뷰 시간 단축

### 개발 효율성

- 리뷰-수정 사이클 시간
- PR 머지 전 수정 횟수
- 전체 개발 시간

## 문제 해결

### AI 리뷰가 생성되지 않는 경우

1. Hobby Plan 제한 확인
2. PR이 올바르게 생성되었는지 확인
3. Graphite Agent 설정 확인

### 리뷰 품질이 낮은 경우

1. 커스텀 규칙 명확화
2. 가이드라인 문서 업데이트
3. 피드백을 Graphite에 제공

### 제한사항 해결

필요한 경우:

1. Starter Plan ($20/월) 고려
2. 통합 완료 후 재평가
3. 대안 도구 검토

## 다음 단계

1. **[설치 가이드](./SETUP_GUIDE.md)** - Graphite CLI 설치
2. **[워크플로우 가이드](./WORKFLOW_GUIDE.md)** - 기본 사용법
3. **[통합 전략](./INTEGRATION_STRATEGY.md)** - Cursor 통합 계획

## 참고 자료

- [Graphite Agent 공식 문서](https://www.graphite.com/guides/ai-coding-model-comparison)
- [커스텀 규칙 가이드](https://docs.graphite.dev/agent/custom-rules)
- [패키지 개선 가이드라인](../PACKAGE_IMPROVEMENT_GUIDELINES.md)

---

**작성일**: 2025-12-21  
**태그**: #graphite #agent #ai-review #code-review
