---
name: Code Review
description: HUA Platform의 코드 리뷰 가이드라인을 따르는 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# 코드 리뷰 스킬

이 스킬은 HUA Platform의 코드 리뷰 가이드라인을 따르는 방법을 안내합니다.

## 🚨 AI 어시스턴트 필수 준수 사항

### 코드 리뷰 시 필수 확인

```
IF (코드 리뷰를 수행할 때) THEN
  1. 체크리스트 자동 생성 확인
  2. 파일 타입별 체크리스트 확인
  3. 타입 안전성 확인
  4. 보안 취약점 확인
  5. 성능 영향 확인
END IF
```

### 자동 검증 로직

```
IF (코드 리뷰) THEN
  IF (any 타입 사용) THEN
    → "any 타입 사용을 지양하세요. 명시적 타입을 정의하세요."
  END IF
  
  IF (보안 취약점 감지) THEN
    → "보안 취약점이 감지되었습니다. 입력값 검증을 추가하세요."
  END IF
  
  IF (성능 이슈 감지) THEN
    → "성능 이슈가 감지되었습니다. 메모이제이션을 고려하세요."
  END IF
END IF
```

## 코드 리뷰 체크리스트

### 일반 체크리스트

- [ ] 코드 스타일 일관성 확인
- [ ] 사용하지 않는 import 제거 확인
- [ ] 주석 및 TODO 확인
- [ ] 성능 영향 확인
- [ ] 보안 취약점 확인
- [ ] Breaking Changes 확인

### 컴포넌트 체크리스트

- [ ] 접근성(A11y) 속성 확인 (aria-label, role, tabIndex 등)
- [ ] JSDoc 문서화 확인
- [ ] TypeScript 타입 안정성 확인 (any 타입 사용 여부)
- [ ] React.memo 또는 useMemo/useCallback 최적화 확인
- [ ] Props 인터페이스 명확성 확인
- [ ] 에러 처리 및 경계 케이스 확인
- [ ] 다크 모드 지원 확인
- [ ] 반응형 디자인 확인

### API 체크리스트

- [ ] 인증/인가 로직 확인
- [ ] 에러 처리 및 상태 코드 확인
- [ ] 입력값 검증 확인
- [ ] 타입 안정성 확인 (Supabase 쿼리 타입 등)
- [ ] 보안 취약점 확인 (SQL Injection, XSS 등)
- [ ] Rate limiting 확인
- [ ] 로깅 및 모니터링 확인
- [ ] API 문서 업데이트 확인

### 유틸리티 체크리스트

- [ ] 함수 순수성 확인 (side effect 없음)
- [ ] 에러 처리 확인
- [ ] 타입 안정성 확인
- [ ] 성능 최적화 확인
- [ ] 재사용성 확인
- [ ] 테스트 커버리지 확인

## 리뷰 포인트

### 타입 안전성

- `any` 타입 사용 지양
- 명시적 타입 정의
- 타입 가드 활용

### 코드 품질

- ESLint 규칙 준수
- Prettier 포맷팅 적용
- 중복 코드 제거
- 복잡도 관리

### 성능

- 불필요한 리렌더링 방지
- 메모이제이션 적절히 활용
- 번들 크기 최적화

### 보안

- 입력값 검증
- SQL Injection 방지
- XSS 방지
- 인증/인가 확인

## 리뷰 생성

### 자동 생성 (권장)

```bash
pnpm generate:review-checklist
```

**기능:**
- 변경된 파일 자동 분석
- 파일 타입별 체크리스트 생성
- 패턴 문서 참조

### 수동 확인

`CODE_REVIEW_CHECKLIST.md` 파일을 참고하여 수동으로 확인:

```markdown
## 코드 리뷰 체크리스트

### 일반 체크리스트
- [ ] 코드 스타일 일관성 확인
- [ ] 사용하지 않는 import 제거 확인
...
```

## 리뷰 코멘트 작성

### ✅ 올바른 예시: 긍정적 피드백

```markdown
✅ Good: Clear type definitions and error handling
```

### ✅ 올바른 예시: 개선 제안

```markdown
💡 Suggestion: Consider using `useMemo` here to avoid unnecessary recalculations
```

### ✅ 올바른 예시: 필수 수정

```markdown
❌ Required: This `any` type should be replaced with a proper type definition
```

## 승인 기준

### 필수 조건

- [ ] 모든 체크리스트 항목 통과
- [ ] 타입 체크 통과
- [ ] 린트 통과
- [ ] 빌드 성공
- [ ] 최소 1명의 승인

### 선택 조건

- [ ] 테스트 추가/수정
- [ ] 문서 업데이트
- [ ] 성능 테스트 완료

## AI 어시스턴트 실행 체크리스트

코드 리뷰 시 다음을 자동으로 확인하세요:

### 체크리스트 확인
- [ ] 관련 체크리스트를 모두 확인했는가?
- [ ] 파일 타입별 체크리스트를 확인했는가?

### 타입 안전성
- [ ] 타입 안전성을 확인했는가?
- [ ] any 타입 사용을 확인했는가?

### 보안
- [ ] 보안 취약점을 확인했는가?
- [ ] 입력값 검증을 확인했는가?

### 성능
- [ ] 성능 영향을 확인했는가?
- [ ] 불필요한 리렌더링을 확인했는가?

### 피드백
- [ ] 적절한 피드백을 제공했는가?
- [ ] 승인 기준을 충족했는가?

## 참고

- 코드 리뷰 체크리스트: `CODE_REVIEW_CHECKLIST.md`
- 리뷰 체크리스트 생성: `scripts/generate-review-checklist.ts`
- 패턴 문서: `docs/patterns/`
