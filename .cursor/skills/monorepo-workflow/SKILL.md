---
name: Monorepo Workflow
description: HUA Platform 모노레포에서 작업하는 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# 모노레포 워크플로우 스킬

이 스킬은 HUA Platform 모노레포에서 작업하는 올바른 방법을 안내합니다.

## 프로젝트 구조

```
hua-platform/
├── apps/                    # 애플리케이션들
│   ├── my-chat/
│   ├── my-api/
│   ├── my-app/
│   └── ...
├── packages/               # 공통 패키지들
│   ├── hua-ui/
│   ├── hua-i18n-sdk/
│   └── ...
└── scripts/                # 공통 스크립트
```

## 패키지 매니저

- **사용**: pnpm 10.24.0+
- **설치**: 루트에서 `pnpm install` 실행
- **워크스페이스**: `apps/*`, `packages/*` 자동 인식

## 작업 위치 결정

### 앱 작업
- **위치**: `apps/{app-name}/`
- **예시**: `apps/my-app/`

### 패키지 작업
- **위치**: `packages/{package-name}/`
- **예시**: `packages/hua-ui/`

### 공통 스크립트
- **위치**: `scripts/`
- **사용**: 루트에서 `pnpm run {script-name}`

## 명령어 실행

### 루트에서 전체 실행

```bash
# 모든 앱 개발 서버 시작
pnpm dev

# 모든 패키지 빌드
pnpm build

# 모든 패키지 타입 체크
pnpm type-check

# 모든 패키지 린트
pnpm lint
```

### 특정 앱/패키지만 실행

```bash
# 특정 앱 개발
pnpm dev --filter=my-app

# 특정 패키지 빌드
pnpm build --filter=hua-ui

# 특정 앱 타입 체크
pnpm type-check --filter=my-api
```

### 앱 내부에서 실행

```bash
# 앱 폴더로 이동
cd apps/my-app

# 로컬 명령어 실행
pnpm dev
pnpm build
```

## 의존성 관리

### 패키지 간 의존성

```json
// apps/my-app/package.json
{
  "dependencies": {
    "@hua-labs/ui": "workspace:*",
    "@hua-labs/i18n-sdk": "workspace:*"
  }
}
```

### 새 패키지 추가

```bash
# 루트에서 실행
pnpm add {package-name} --filter=my-app

# 또는 앱 폴더에서
cd apps/my-app
pnpm add {package-name}
```

## 경로 별칭

### TypeScript 경로

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@hua-labs/*": ["./packages/*/src"]
    }
  }
}
```

### 사용 예시

```typescript
// 앱에서 패키지 import
import { Button } from '@hua-labs/ui'
import { useI18n } from '@hua-labs/i18n-sdk'

// 앱 내부 import
import { Component } from '@/components'
```

## Turbo 빌드

- **사용**: Turbo를 사용한 병렬 빌드
- **설정**: `turbo.json` 파일 참조
- **캐싱**: 자동 빌드 캐싱 지원

## Graphite와 함께 사용하기

### 패키지 변경 워크플로우

패키지 간 의존성이 있는 변경 시 Graphite를 사용하여 단계적으로 작업:

```bash
# 1. 하위 패키지부터 변경
gt create -m "feat(packages/hua-ui): update Button component"

# 2. 의존하는 앱들 업데이트
gt create -m "feat(apps/my-app): migrate to new Button API"
gt create -m "feat(apps/my-api): migrate to new Button API"

# 3. PR 제출
gt submit
```

**병합 순서**:
- 하위 패키지 PR 먼저 병합
- 상위 앱 PR 순차 병합

### 의존성 변경 시 주의사항

1. **순환 의존성 방지**
   - `motion-core → ui` 같은 금지된 의존성 확인
   - 스택 분리 시 의존성 방향 확인 필수

2. **Turbo 빌드 통합**
   - `dependsOn: ["^build"]` 설정으로 자동 처리
   - 각 PR에서 관련 패키지만 빌드

3. **workspace 의존성**
   - `workspace:*` 사용 시 패키지 버전 일치 확인
   - 패키지 변경 후 의존하는 앱들도 함께 업데이트

## 체크리스트

모노레포 작업 시 다음을 확인하세요:

- [ ] 올바른 위치에서 작업하고 있는가? (apps/ 또는 packages/)
- [ ] 루트에서 `pnpm install`을 실행했는가?
- [ ] `--filter` 옵션을 올바르게 사용했는가?
- [ ] 패키지 간 의존성이 올바르게 설정되었는가?
- [ ] 경로 별칭을 올바르게 사용했는가?

### Graphite 사용 시 추가 체크리스트

- [ ] 패키지 변경 시 하위 패키지부터 스택을 생성했는가?
- [ ] 순환 의존성 규칙을 위반하지 않았는가?
- [ ] 병합 순서가 올바른가? (하위 → 상위)
