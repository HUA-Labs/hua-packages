# Public 레포에서 Main 레포로 패키지 코드 복사 계획

## 목표
C:\HUA-Labs-public의 packages 코드를 C:\hua\packages로 복사하여 개발 환경을 통합합니다.

## 현재 상태

### C:\HUA-Labs-public (Public 레포)
**Packages (9개)**:
- create-hua-ux
- hua-i18n-beginner
- hua-i18n-core
- hua-i18n-core-zustand
- hua-i18n-loaders
- hua-motion-core
- hua-state
- hua-ui
- hua-ux

**최신 커밋**: `c5e7cbe` - feat(ci): improve workflow logging and path filtering

### C:\hua (Private 레포 - 개발 환경)
**Packages (27개)**:
- 이미 많은 패키지가 존재
- 일부 패키지는 public과 다른 구조

**현재 브랜치**: `12-30-feat_scripts_add_deployment_automation_scripts`
**Unstaged changes**: test-welcome-app, test-welcome-server 삭제됨

## 복사 전략

### 공통 패키지 복사 (9개)
다음 패키지들을 public 레포의 최신 버전으로 복사:

1. **create-hua-ux**
2. **hua-i18n-beginner**
3. **hua-i18n-core**
4. **hua-i18n-core-zustand**
5. **hua-i18n-loaders**
6. **hua-motion-core**
7. **hua-state**
8. **hua-ui**
9. **hua-ux**

## Graphite 스택 분리 전략

논리적 단위로 분리하여 스택 생성:

### 스택 1: Core 패키지 (의존성 하위 레벨)
- hua-i18n-core
- hua-i18n-core-zustand
- hua-state
- hua-motion-core

**이유**: 다른 패키지들이 의존하는 기본 패키지들

### 스택 2: i18n 확장 패키지
- hua-i18n-beginner
- hua-i18n-loaders

**이유**: i18n-core에 의존하는 확장 패키지들

### 스택 3: UI 패키지
- hua-ui

**이유**: 독립적인 UI 컴포넌트 라이브러리

### 스택 4: Framework 패키지
- hua-ux

**이유**: 다른 패키지들을 통합하는 프레임워크 레이어

### 스택 5: CLI 도구
- create-hua-ux

**이유**: 독립적인 CLI 도구

## 작업 순서

### Phase 1: 준비 작업
1. 현재 변경사항 정리 (test-welcome-app, test-welcome-server 삭제 커밋)
2. public-repo 최신화
3. main 브랜치로 체크아웃

### Phase 2: 패키지별 복사 (Graphite 스택으로)

각 스택은 논리적 단위로 분리하여 `gt create`로 생성합니다.

## 복사 방법

### 방법 1: Git Cherry-pick (권장)
public-repo의 커밋을 cherry-pick하여 이력 보존

### 방법 2: 파일 복사
직접 파일 복사 후 Graphite 스택 생성

### 방법 3: Git Merge
public-repo/main을 merge (충돌 가능성 높음)

## 주의사항

1. **충돌 해결**: hua 레포에만 있는 파일은 보존
2. **의존성 확인**: package.json의 workspace 의존성 확인
3. **테스트**: 각 패키지 복사 후 빌드 및 테스트 실행
4. **Graphite 워크플로우**: `gt create` 사용, `git commit` 금지
5. **원본 보존**: C:\HUA-Labs-public는 그대로 유지
