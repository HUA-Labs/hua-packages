---
name: Document Patterns
description: 중요한 패턴을 별도 문서에 기록하는 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# 패턴 문서화 스킬

이 스킬은 중요한 패턴을 별도 문서에 기록하는 방법을 안내합니다.

## 패턴 문서화 원칙

### 1. 반복되는 문제 기록
- 같은 문제가 여러 번 발생하는 경우
- 해결 방법이 명확한 경우
- 팀원들이 참고할 가치가 있는 경우

### 2. 구조화된 문서
- 문제 상황, 원인, 해결 방법, 예방 방법으로 구성
- 체크리스트 포함
- 관련 링크 포함

### 3. 지속적 업데이트
- 새로운 패턴 발견 시 추가
- 해결 방법 개선 시 업데이트
- 관련 데브로그 링크 추가

## 패턴 문서 위치

### 문서 구조

```
docs/patterns/
├── README.md              # 패턴 문서 목록
├── build-errors.md        # 빌드 오류 패턴
├── type-errors.md         # 타입 오류 패턴
├── dependency-management.md  # 의존성 관리 패턴
├── environment-setup.md   # 환경 설정 패턴
├── code-quality.md        # 코드 품질 패턴
└── deployment.md          # 배포 패턴
```

## 패턴 문서 구조

### 기본 구조

```markdown
# [패턴 이름] 패턴

**작성일**: YYYY-MM-DD  
**목적**: 반복되는 문제 패턴을 정리하여 개발 효율성 향상

---

## 문제 상황

[문제가 발생하는 상황 설명]

## 원인 분석

[문제의 근본 원인]

## 해결 방법

### 방법 1: [해결 방법]
[상세 설명]

**코드 예시**:
```typescript
// 예시 코드
```

### 방법 2: [대안 해결 방법]
[상세 설명]

## 예방 방법

1. 예방 방법 1
2. 예방 방법 2

## 관련 데브로그

- [데브로그 링크](./../devlogs/DEVLOG_YYYY-MM-DD_제목.md)

## 체크리스트

이 패턴을 만났을 때 확인할 사항:
- [ ] 체크 항목 1
- [ ] 체크 항목 2
```

## 패턴 문서 작성 가이드

### 1. 문제 상황

```markdown
## 문제 상황

ESLint 경고: 사용하지 않는 import가 많음
빌드 오류: Module not found
타입 에러: Type 'X' is not assignable to type 'Y'
```

### 2. 원인 분석

```markdown
## 원인 분석

- 기능 제거 후 import 정리 누락
- 리팩토링 과정에서 import 정리 누락
- 타입 정의가 불완전함
```

### 3. 해결 방법

```markdown
## 해결 방법

#### 수동 제거
```typescript
// ❌ 이전
import { HeroSection, Suspense } from '@/components';
import { Icon } from '@hua-labs/ui';

// ✅ 이후
// 사용하지 않는 import 제거
```

#### 자동화 (IDE)
- VS Code: "Organize Imports" 기능 사용
- ESLint 자동 수정: `eslint --fix`
```

### 4. 예방 방법

```markdown
## 예방 방법

1. **커밋 전 확인**: 사용하지 않는 import 제거
2. **자동화 도구**: pre-commit hook에 import 정리 추가
3. **코드 리뷰**: 사용하지 않는 import 확인
```

## 패턴 문서 카테고리

### 빌드 오류 패턴
- 파일: `docs/patterns/build-errors.md`
- 내용: 빌드 실패 원인과 해결 방법

### 타입 오류 패턴
- 파일: `docs/patterns/type-errors.md`
- 내용: TypeScript 타입 에러 해결 방법

### 의존성 관리 패턴
- 파일: `docs/patterns/dependency-management.md`
- 내용: 패키지 의존성 문제 해결

### 환경 설정 패턴
- 파일: `docs/patterns/environment-setup.md`
- 내용: 환경 변수 및 설정 문제

### 코드 품질 패턴
- 파일: `docs/patterns/code-quality.md`
- 내용: 코드 품질 개선 패턴

### 배포 패턴
- 파일: `docs/patterns/deployment.md`
- 내용: 배포 관련 문제 해결

## 패턴 문서 업데이트

### 새 패턴 추가

1. 관련 카테고리 문서 확인
2. 없으면 새 문서 생성
3. 패턴 추가:
   - 문제 상황
   - 원인 분석
   - 해결 방법
   - 예방 방법
   - 관련 데브로그 링크

### 기존 패턴 업데이트

1. 관련 문서 찾기
2. 새로운 해결 방법 추가
3. 예방 방법 업데이트
4. 관련 데브로그 링크 추가

## README 업데이트

패턴 문서 작성 후 `docs/patterns/README.md`에 추가:

```markdown
## 목차

1. [빌드 오류 패턴](./build-errors.md)
2. [타입 오류 패턴](./type-errors.md)
3. [새 패턴](./new-pattern.md)
```

## 체크리스트

패턴 문서 작성 시 다음을 확인하세요:

- [ ] 문제 상황이 명확히 설명되었는가?
- [ ] 원인 분석이 포함되었는가?
- [ ] 해결 방법이 단계별로 설명되었는가?
- [ ] 예방 방법이 포함되었는가?
- [ ] 관련 데브로그 링크가 있는가?
- [ ] 체크리스트가 포함되었는가?
- [ ] README.md에 링크가 추가되었는가?

## 참고

- 패턴 문서: `docs/patterns/`
- 패턴 문서 README: `docs/patterns/README.md`
- 예시: `docs/patterns/code-quality.md`
- 데브로그: `docs/devlogs/`
