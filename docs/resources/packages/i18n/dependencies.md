# HUA i18n 패키지 의존성 분석 및 개선 가이드

## 📋 목차

1. [개요](#개요)
2. [패키지 의존성 구조](#패키지-의존성-구조)
3. [발견된 문제점](#발견된-문제점)
4. [개선 계획](#개선-계획)
5. [Peer Dependencies 가이드](#peer-dependencies-가이드)

---

## 개요

이 문서는 HUA Platform의 i18n 관련 패키지들 간의 의존성 관계를 분석하고, peer dependencies 설정을 개선하기 위한 가이드를 제공합니다.

### 분석 대상 패키지

- `@hua-labs/i18n-core` - 핵심 i18n 라이브러리
- `@hua-labs/i18n-core-zustand` - Zustand 어댑터
- `@hua-labs/i18n-loaders` - 로더 및 캐싱 유틸리티
- `@hua-labs/i18n-advanced` - 고급 기능 (성능 모니터링, 대시보드)
- `@hua-labs/i18n-beginner` - 초보자용 간단한 설정
- `@hua-labs/i18n-debug` - 디버깅 도구
- `@hua-labs/i18n-plugins` - 플러그인 시스템
- `@hua-labs/i18n-ai` - AI 번역 기능
- `@hua-labs/i18n-sdk` - 레거시 패키지 (deprecated)

---

## 패키지 의존성 구조

### 의존성 그래프

```
┌─────────────────────────────────────────────────────────┐
│                    @hua-labs/i18n-core                   │
│              (핵심 라이브러리, React peer dependency)     │
└────────────────────┬──────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┬────────────┐
        │            │            │            │            │
        ▼            ▼            ▼            ▼            ▼
┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│zustand    │ │loaders   │ │advanced  │ │debug     │ │plugins   │
│adapter    │ │          │ │          │ │          │ │          │
└───────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
     │            │            │            │            │
     │            │            │            │            │
     └────────────┴────────────┴────────────┴────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Applications   │
                    │  (my-api, etc) │
                    └─────────────────┘
```

### 현재 의존성 상태

| 패키지 | dependencies | peerDependencies | 문제점 |
|--------|-------------|------------------|--------|
| `i18n-core` | `react: ^19.2.0` | `react: >=16.8.0` | ❌ react가 dependencies에 있음 |
| `i18n-core-zustand` | `@hua-labs/i18n-core: workspace:*` | `zustand: ^4.0.0`, `react: >=16.8.0` | ✅ 올바름 |
| `i18n-loaders` | `@hua-labs/i18n-core: workspace:*` | 없음 | ⚠️ react peerDependency 누락 가능성 |
| `i18n-advanced` | `@hua-labs/i18n-core: workspace:*`, `react: ^19.2.0` | `react: >=16.8.0` | ❌ react가 dependencies에 있음 |
| `i18n-beginner` | `react: ^19.2.0` | `react: >=16.8.0` | ❌ react가 dependencies에 있음, core 의존성 없음 |
| `i18n-debug` | `@hua-labs/i18n-core: workspace:*`, `react: ^19.2.0` | `react: >=16.8.0` | ❌ react가 dependencies에 있음 |
| `i18n-plugins` | `@hua-labs/i18n-core: workspace:*` | 없음 | ⚠️ react peerDependency 누락 가능성 |
| `i18n-ai` | `@hua-labs/i18n-core: workspace:*`, `openai: ^4.0.0` | 없음 | ⚠️ react peerDependency 누락 가능성 |

---

## 발견된 문제점

### 1. React 의존성 문제

**문제**: 여러 패키지에서 `react`를 `dependencies`에 포함하고 있습니다.

**영향**:
- 번들 크기 증가: 각 패키지가 자체 React 인스턴스를 포함할 수 있음
- 버전 충돌: 여러 React 버전이 설치될 수 있음
- 모노레포에서 불필요한 중복 설치

**영향받는 패키지**:
- `@hua-labs/i18n-core`
- `@hua-labs/i18n-advanced`
- `@hua-labs/i18n-debug`
- `@hua-labs/i18n-beginner`

### 2. Peer Dependencies 누락

**문제**: 일부 패키지에서 `react`를 `peerDependencies`에 명시하지 않았습니다.

**영향**:
- 사용자가 React를 설치하지 않아도 패키지 설치가 가능 (런타임 에러 발생)
- TypeScript 타입 체크 시 React 타입을 찾지 못할 수 있음

**영향받는 패키지**:
- `@hua-labs/i18n-loaders` (React 사용 여부 확인 필요)
- `@hua-labs/i18n-plugins` (React 사용 여부 확인 필요)
- `@hua-labs/i18n-ai` (React 사용 여부 확인 필요)

### 3. 불필요한 의존성

**문제**: `@hua-labs/i18n-beginner`가 `@hua-labs/i18n-core`에 대한 의존성이 없습니다.

**확인 필요**: `i18n-beginner`가 독립적인 패키지인지, 아니면 `i18n-core`를 사용하는지 확인 필요

---

## 개선 계획

### Phase 1: React 의존성 정리

#### 1.1 `@hua-labs/i18n-core`

**현재**:
```json
{
  "dependencies": {
    "react": "^19.2.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

**개선 후**:
```json
{
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "devDependencies": {
    "react": "^19.2.0"
  }
}
```

**이유**: React는 런타임에 애플리케이션에서 제공되므로 `peerDependencies`로만 선언해야 합니다.

#### 1.2 `@hua-labs/i18n-advanced`

**현재**:
```json
{
  "dependencies": {
    "@hua-labs/i18n-core": "workspace:*",
    "react": "^19.2.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

**개선 후**:
```json
{
  "dependencies": {
    "@hua-labs/i18n-core": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "devDependencies": {
    "react": "^19.2.0"
  }
}
```

#### 1.3 `@hua-labs/i18n-debug`

**현재**:
```json
{
  "dependencies": {
    "@hua-labs/i18n-core": "workspace:*",
    "react": "^19.2.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

**개선 후**:
```json
{
  "dependencies": {
    "@hua-labs/i18n-core": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "devDependencies": {
    "react": "^19.2.0"
  }
}
```

#### 1.4 `@hua-labs/i18n-beginner`

**현재**:
```json
{
  "dependencies": {
    "react": "^19.2.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

**개선 후**:
```json
{
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "devDependencies": {
    "react": "^19.2.0"
  }
}
```

**추가 확인 필요**: `i18n-beginner`가 `i18n-core`를 사용하는지 확인하고, 사용한다면 의존성 추가 필요

### Phase 2: Peer Dependencies 추가

#### 2.1 `@hua-labs/i18n-loaders`

**확인 필요**: React를 사용하는지 확인

**가능한 개선**:
```json
{
  "dependencies": {
    "@hua-labs/i18n-core": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

#### 2.2 `@hua-labs/i18n-plugins`

**확인 필요**: React를 사용하는지 확인

**가능한 개선**:
```json
{
  "dependencies": {
    "@hua-labs/i18n-core": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

#### 2.3 `@hua-labs/i18n-ai`

**확인 필요**: React를 사용하는지 확인

**가능한 개선**:
```json
{
  "dependencies": {
    "@hua-labs/i18n-core": "workspace:*",
    "openai": "^4.0.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

### Phase 3: 의존성 관계 명확화

#### 3.1 `@hua-labs/i18n-beginner` 의존성 확인

`i18n-beginner`가 `i18n-core`를 사용하는지 확인하고, 사용한다면 의존성 추가:

```json
{
  "dependencies": {
    "@hua-labs/i18n-core": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

---

## Peer Dependencies 가이드

### Peer Dependencies란?

`peerDependencies`는 패키지가 런타임에 필요로 하지만, 패키지 자체가 설치하지 않는 의존성입니다. 대신 사용하는 애플리케이션이 해당 의존성을 제공해야 합니다.

### 언제 사용해야 하나?

1. **라이브러리가 프레임워크를 사용하는 경우**
   - React, Vue, Angular 등
   - 애플리케이션에서 이미 설치되어 있음

2. **단일 인스턴스가 필요한 경우**
   - React는 애플리케이션당 하나의 인스턴스만 있어야 함
   - 여러 버전이 설치되면 에러 발생

3. **플러그인/어댑터 패키지**
   - Zustand, Redux 등 상태 관리 라이브러리 어댑터
   - 메인 라이브러리는 애플리케이션에서 제공

### Best Practices

1. **React 패키지**: 항상 `peerDependencies`에 `react: ">=16.8.0"` 포함
2. **devDependencies**: 개발/테스트를 위해 `devDependencies`에 실제 버전 포함
3. **버전 범위**: 호환 가능한 최소 버전부터 최신까지 넓게 설정
4. **문서화**: README에 필요한 peer dependencies 명시

### 예시

```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "devDependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3"
  }
}
```

---

## 체크리스트

### 각 패키지별 확인 사항

- [ ] React를 사용하는가?
  - [ ] 사용함 → `peerDependencies`에 `react: ">=16.8.0"` 추가
  - [ ] 사용 안 함 → `peerDependencies`에 포함하지 않음
- [ ] `dependencies`에 React가 있는가?
  - [ ] 있음 → 제거하고 `peerDependencies`로 이동, `devDependencies`에 추가
- [ ] `@hua-labs/i18n-core`를 사용하는가?
  - [ ] 사용함 → `dependencies`에 `@hua-labs/i18n-core: workspace:*` 추가
- [ ] 다른 외부 라이브러리 의존성이 있는가?
  - [ ] 있음 → `peerDependencies` 또는 `dependencies`에 적절히 배치

---

---

## 트리 쉐이킹 (Tree Shaking) 및 사이드 이펙트

### 현재 상태

#### ✅ 잘 설정된 부분

1. **ES Modules 사용**
   - TypeScript 설정: `module: "esnext"`
   - 빌드 결과물이 ES modules 형식 (`import`/`export`)
   - 번들러가 트리 쉐이킹 가능

2. **명확한 Exports**
   - `package.json`에 `exports` 필드 정의
   - 타입 정의 포함 (`types` 필드)

#### ❌ 개선이 필요한 부분

1. **`sideEffects` 필드 누락**
   - 모든 패키지에 `sideEffects` 필드가 없음
   - 번들러가 모든 코드를 사이드 이펙트가 있다고 가정할 수 있음
   - 트리 쉐이킹이 제대로 작동하지 않을 수 있음

2. **서브패스 Exports 부족**
   - 현재 모든 패키지가 루트 export만 제공
   - 세밀한 import가 불가능 (예: `@hua-labs/i18n-core/hooks`)

### 사이드 이펙트란?

사이드 이펙트는 모듈을 import할 때 실행되는 코드입니다. 예를 들어:

```javascript
// 사이드 이펙트가 있는 코드
import './styles.css'; // CSS 파일 로드
console.log('Module loaded'); // 즉시 실행
window.myGlobal = 'value'; // 전역 변수 설정
```

번들러는 `sideEffects: false`로 설정하면 사용하지 않는 코드를 안전하게 제거할 수 있습니다.

### 개선 계획

#### Phase 1: `sideEffects` 필드 추가

##### 1.1 `@hua-labs/i18n-core`

**현재**: `sideEffects` 필드 없음

**개선 후**:
```json
{
  "sideEffects": false
}
```

**이유**: 
- CSS 파일 없음
- 전역 변수 설정 없음
- 순수 함수와 React 컴포넌트만 export
- 모든 코드가 트리 쉐이킹 가능

##### 1.2 `@hua-labs/i18n-core-zustand`

**개선 후**:
```json
{
  "sideEffects": false
}
```

##### 1.3 `@hua-labs/i18n-loaders`

**개선 후**:
```json
{
  "sideEffects": false
}
```

##### 1.4 `@hua-labs/i18n-advanced`

**개선 후**:
```json
{
  "sideEffects": false
}
```

##### 1.5 `@hua-labs/i18n-debug`

**주의**: 디버그 도구는 개발 환경에서만 사용되므로, 프로덕션에서 트리 쉐이킹되어야 함

**개선 후**:
```json
{
  "sideEffects": false
}
```

##### 1.6 `@hua-labs/i18n-plugins`

**개선 후**:
```json
{
  "sideEffects": false
}
```

##### 1.7 `@hua-labs/i18n-ai`

**개선 후**:
```json
{
  "sideEffects": false
}
```

##### 1.8 `@hua-labs/i18n-beginner`

**개선 후**:
```json
{
  "sideEffects": false
}
```

#### Phase 2: 서브패스 Exports 추가 (선택사항)

더 세밀한 import를 위해 서브패스 exports를 추가할 수 있습니다:

##### 2.1 `@hua-labs/i18n-core`

**개선 후**:
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./hooks": {
      "import": "./dist/hooks/index.js",
      "require": "./dist/hooks/index.js",
      "types": "./dist/hooks/index.d.ts"
    },
    "./core": {
      "import": "./dist/core/index.js",
      "require": "./dist/core/index.js",
      "types": "./dist/core/index.d.ts"
    },
    "./types": {
      "import": "./dist/types/index.js",
      "require": "./dist/types/index.js",
      "types": "./dist/types/index.d.ts"
    }
  }
}
```

**사용 예시**:
```typescript
// 전체 import
import { useTranslation, createCoreI18n } from '@hua-labs/i18n-core';

// 세밀한 import (트리 쉐이킹 최적화)
import { useTranslation } from '@hua-labs/i18n-core/hooks';
import type { I18nConfig } from '@hua-labs/i18n-core/types';
```

**주의**: 서브패스 exports를 추가하려면 각 모듈에 `index.ts` 파일이 필요합니다.

### 트리 쉐이킹 검증

#### Webpack 설정 예시

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false, // package.json의 sideEffects 필드 사용
  },
  resolve: {
    conditionNames: ['import', 'require', 'default'],
  },
};
```

#### 번들 크기 확인

```bash
# 번들 분석
npm run build -- --analyze

# 또는 webpack-bundle-analyzer 사용
npx webpack-bundle-analyzer dist/stats.json
```

### Best Practices

1. **`sideEffects: false` 설정**
   - CSS 파일이 없는 경우
   - 전역 변수 설정이 없는 경우
   - 폴리필이 없는 경우

2. **`sideEffects: ["*.css"]` 설정**
   - CSS 파일이 있는 경우
   - 특정 파일만 사이드 이펙트로 표시

3. **명확한 Exports**
   - 필요한 것만 export
   - 서브패스 exports로 세밀한 import 지원

4. **ES Modules 사용**
   - CommonJS 대신 ES Modules 사용
   - `module: "esnext"` 설정

5. **타입 정의 포함**
   - `types` 필드로 TypeScript 지원
   - `declaration: true` 설정

### 사이드 이펙트 체크리스트

각 패키지별 확인 사항:

- [ ] CSS 파일이 있는가?
  - [ ] 있음 → `sideEffects: ["*.css"]` 또는 `sideEffects: ["dist/**/*.css"]`
  - [ ] 없음 → `sideEffects: false`
- [ ] 전역 변수를 설정하는가?
  - [ ] 설정함 → 해당 파일을 `sideEffects` 배열에 추가
  - [ ] 설정 안 함 → `sideEffects: false`
- [ ] 폴리필을 포함하는가?
  - [ ] 포함함 → 해당 파일을 `sideEffects` 배열에 추가
  - [ ] 포함 안 함 → `sideEffects: false`
- [ ] 즉시 실행되는 코드가 있는가?
  - [ ] 있음 → 해당 파일을 `sideEffects` 배열에 추가
  - [ ] 없음 → `sideEffects: false`

### 예상 효과

#### 번들 크기 감소

- **현재**: 전체 패키지 import 시 모든 코드 포함
- **개선 후**: 사용하는 코드만 포함 (약 30-50% 감소 예상)

#### 로딩 성능 향상

- 불필요한 코드 제거로 초기 로딩 시간 단축
- 코드 스플리팅과 함께 사용 시 더 큰 효과

---

## 참고 자료

- [npm Peer Dependencies 문서](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#peerdependencies)
- [pnpm Peer Dependencies 가이드](https://pnpm.io/package_json#peerdependencies)
- [React 라이브러리 개발 가이드](https://react.dev/learn/start-a-new-react-project#can-i-use-react-without-a-framework)
- [Webpack Tree Shaking 가이드](https://webpack.js.org/guides/tree-shaking/)
- [Rollup Tree Shaking](https://rollupjs.org/introduction/#tree-shaking)
- [ES Modules와 Tree Shaking](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

---

## 업데이트 이력

- 2025-01-XX: 초기 문서 작성
- 의존성 분석 및 문제점 도출
- 개선 계획 수립
- 트리 쉐이킹 및 사이드 이펙트 분석 추가

